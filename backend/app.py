from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as palm
import pandas as pd
from clarifai.client.model import Model
import joblib
import re




activity_level_multipliers = {
    "Sedentary": 1.2,
    "Lightly active": 1.375,
    "Moderately active": 1.55,
    "Very active": 1.725,
    "Extra active": 1.9,
}

activity_details = """
Sedentary: Little or no exercise (e.g., desk job) \n
Lightly active: Light exercise 1-3 days per week \n
Moderately active: Moderate exercise 3-5 days per week \n
Very active: Hard exercise 6-7 days per week \n
Extra active: Very hard exercise or physical job
"""

# Define the macronutrient percentages
macronutrient_percentages = {
    "Carbohydrates": (45, 65),
    "Protein": (10, 35),
    "Fats": (20, 35),
}

gender_list = ['Male', 'Female']
goal_list = ['Gain Muscle', 'Lose Weight', 'Maintain']
activity_level_list = ["Sedentary", "Lightly active", "Moderately active", "Very active", "Extra active"]


# Define the mapping lists for locations (as used during training)
locations = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
                'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
                'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
                'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
                'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
                'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
                'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico',
                'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
                'United States', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
                'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

# These are the encoded values corresponding to each location (order matters)
encoded_locations = [8, 27, 35, 1, 19, 26, 43, 5, 14, 4, 37, 31, 48, 2, 24, 18, 42,
                        28, 36, 7, 3, 47, 6, 21, 12, 15, 51, 39, 11, 17, 33, 40, 25, 10,
                        23, 38, 46, 41, 49, 52, 9, 22, 30, 20, 13, 44, 34, 29, 45, 16, 0,
                        32, 50, 53, 54]

# Create a mapping dictionary for location encoding
location_encoding = dict(zip(locations, encoded_locations))

# Define additional encoding dictionaries
gender_encoding = {"Female": 0, "Male": 1, "Other": 2}
smoking_encoding = {"never": 4, "not current": 0, "current": 2, "No Info": 3, "ever": 5, "former": 1}

# The year options should be those the model was trained on (already encoded)
year_options = [2019, 2015, 2017, 2016, 2018, 2020, 2022, 2021]


# Set the person's information
person_info = {
    "age": 25,
    "sex": "Male",
    "height": 1.65,
    "weight": 70,
    "activity level": "Moderately active",
    "goal": "Lose Weight"
}

PALM_API_KEY = "AIzaSyC9zouJ1bcaRjEVHSLKpry7CBPhP3c5ahA"





# Initialize Firebase
cred = credentials.Certificate("firebase-creds.json")  # Replace with your credentials
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load ML model
diabetes_model = joblib.load("random_forest_model.pkl")

# Configure AI APIs
palm.configure(api_key=PALM_API_KEY)  # Set your API key in environment

app = Flask(__name__)

# ================= HELPER FUNCTIONS =================
def calculate_bmi(person_info):
    bmi = person_info["weight"] / person_info["height"] ** 2
    if bmi < 18.5:
        bmi_class = "underweight"
    elif bmi < 25:
        bmi_class = "normal weight"
    elif bmi < 30:
        bmi_class = "overweight"
    else:
        bmi_class = "obese"
    return bmi, bmi_class

def energy_calc(person_info):
    # Calculate the BMR using the Harris-Benedict equation
    if person_info["sex"] == "Male":
        bmr = 88.362 + (13.397 * person_info["weight"]) + (4.799 * person_info["height"]) - (5.677 * person_info["age"])
    else:
        bmr = 447.593 + (9.247 * person_info["weight"]) + (3.100 * person_info["height"]) - (4.330 * person_info["age"])
    # Calculate the TDEE using the activity level multiplier
    tdee = bmr * activity_level_multipliers[person_info["activity level"]]
    return bmr, tdee

def macro_perc(person_info, calories):
    if person_info["goal"].lower() == 'lose weight':
        protein_percentage = 30
        fat_percentage = 25
    elif person_info["goal"].lower() == 'maintain':
        protein_percentage = 25
        fat_percentage = 30
    elif person_info["goal"].lower() == 'gain muscle':
        protein_percentage = 35
        fat_percentage = 20
    else:
        raise ValueError("Invalid goal. Use 'lose', 'maintain', or 'gain'.")
    carb_percentage = 100 - (protein_percentage + fat_percentage)
    protein = (protein_percentage / 100) * calories / 4
    fat = (fat_percentage / 100) * calories / 9
    carbs = (carb_percentage / 100) * calories / 4
    return {'protein': protein, 'fat': fat, 'carbs': carbs}

# Extract table from markdown
def extract_markdown_table(markdown_string):
    table_pattern = re.compile(r'\|(.+?)\|(.+?)\|.*?\n((?:\|.*?\|.*?\n)+)', re.DOTALL)
    match = table_pattern.search(markdown_string)
    if not match:
        print("No Markdown table found.")
        return None
    table_content = match[0]
    return table_content

@app.route('/api/user', methods=['POST'])
def save_user_data():
    user_data = request.json
    user_id = user_data.pop('user_id')  # Get from Firebase Auth in production
    db.collection('users').document(user_id).set(user_data)
    return jsonify({"message": "User data saved"}), 200

@app.route('/api/calculate_metrics', methods=['POST'])
def calculate_metrics():
    # Get user_id from request
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Fetch user document from Firestore
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()

    if not user_data:
        return jsonify({"error": "User not found"}), 404

    # Verify all required fields exist
    required_fields = [
        'age', 'gender', 'height', 
        'weight', 'activity_level', 'goal'
    ]

    if missing_fields := [
        field for field in required_fields if field not in user_data
    ]:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}",
            "missing_fields": missing_fields
        }), 400

    # Prepare person_info from Firestore data
    person_info = {
        "age": user_data['age'],
        "sex": user_data['gender'],
        "height": user_data['height'],
        "weight": user_data['weight'],
        "activity level": user_data['activity_level'],
        "goal": user_data['goal']
    }

    # Calculate metrics
    bmi, bmi_class = calculate_bmi(person_info)
    bmr, tdee = energy_calc(person_info)
    macros = macro_perc(person_info, tdee)

    # Save metrics to user document (optional)
    user_ref.update({
        'last_metrics': {
            'bmi': bmi,
            'bmi_class': bmi_class,
            'bmr': bmr,
            'tdee': tdee,
            'macros': macros,
            'calculated_at': firestore.SERVER_TIMESTAMP
        }
    })

    return jsonify({
        "user_id": user_id,
        "bmi": bmi,
        "bmi_class": bmi_class,
        "bmr": bmr,
        "tdee": tdee,
        "macros": macros
    })



@app.route('/api/food_recipes', methods=['POST'])
def food_recipes():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    temp_path = f"temp_{file.filename}"
    file.save(temp_path)

    model = Model(url="https://clarifai.com/clarifai/main/models/food-item-recognition", pat="6fd248e3fdf34846ae17e4885a54cfa0")
    prediction = model.predict_by_filepath(temp_path, input_type="image")
    
    if prediction.outputs:
        food_name = prediction.outputs[0].data.concepts[0].name
        prompt = f"Generate 10 recipes with {food_name} in table format with columns: Recipe Name, Calories, Protein, Fats, Carbs, Ingredients"
        response = palm.generate_text(prompt=prompt, temperature=0.5, max_output_tokens=2500)
        table = extract_markdown_table(response.result)
        return jsonify({"recipes": table})
    
    return jsonify({"error": "No food detected"}), 400

@app.route('/api/diabetes_check', methods=['POST'])
def diabetes_check():
    # Get user_id from request
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Fetch user document from Firestore
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()

    if not user_data:
        return jsonify({"error": "User not found"}), 404

    # Verify all required fields exist
    required_fields = [
        'gender', 'age', 'location', 'race', 
        'hypertension', 'heart_disease', 'smoking_history',
        'bmi', 'hba1c', 'blood_glucose'
    ]

    if missing_fields := [
        field for field in required_fields if field not in user_data
    ]:
        return jsonify({
            "error": f"Missing required health data fields: {', '.join(missing_fields)}",
            "missing_fields": missing_fields
        }), 400

    # ------------------ Encoding the User Inputs ------------------
    # Year: already one of the encoded values
    encoded_year = 2022

    # Gender encoding
    encoded_gender = gender_encoding[user_data['gender']]

    # Age remains the same
    encoded_age = user_data['age']

    # Location encoding using the mapping dictionary
    encoded_location = location_encoding[user_data['location']]

    # Race encoding: create binary flags for each race column
    race = user_data['race']
    if race == "AfricanAmerican":
        africanamerican, asian, caucasian, hispanic, other_race = 1, 0, 0, 0, 0
    elif race == "Asian":
        africanamerican, asian, caucasian, hispanic, other_race = 0, 1, 0, 0, 0
    elif race == "Caucasian":
        africanamerican, asian, caucasian, hispanic, other_race = 0, 0, 1, 0, 0
    elif race == "Hispanic":
        africanamerican, asian, caucasian, hispanic, other_race = 0, 0, 0, 1, 0
    else:  # "Other"
        africanamerican, asian, caucasian, hispanic, other_race = 0, 0, 0, 0, 1

    # Binary encoding for hypertension and heart disease
    encoded_hypertension = 1 if user_data['hypertension'] == "Yes" else 0
    encoded_heart_disease = 1 if user_data['heart_disease'] == "Yes" else 0

    # Smoking history encoding
    encoded_smoking = smoking_encoding[user_data['smoking_history']]

    # BMI, HbA1c level, and Blood Glucose Level
    encoded_bmi = user_data['bmi']
    encoded_hba1c = user_data['hba1c']
    encoded_blood_glucose = user_data['blood_glucose']

    # ------------------ Preparing the Input for the Model ------------------
    input_data = {
        "year": [encoded_year],
        "gender": [encoded_gender],
        "age": [encoded_age],
        "location": [encoded_location],
        "africanamerican": [africanamerican],
        "asian": [asian],
        "caucasian": [caucasian],
        "hispanic": [hispanic],
        "other": [other_race],
        "hypertension": [encoded_hypertension],
        "heart_disease": [encoded_heart_disease],
        "smoking_history": [encoded_smoking],
        "bmi": [encoded_bmi],
        "hbA1c_level": [encoded_hba1c],
        "blood_glucose_level": [encoded_blood_glucose],
    }
    input_df = pd.DataFrame(input_data)

    # Make prediction and return result
    try:
        prediction = diabetes_model.predict(input_df)[0]
        return jsonify({
            "prediction": "yes" if int(prediction) == 1 else "no",
            "prediction_code": int(prediction),
            "user_id": user_id
        })
    except Exception as e:
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    response = palm.generate_text(prompt=user_message, temperature=0.5, max_output_tokens=1000)
    return jsonify({"response": response.result})

@app.route('/api/diet', methods=['POST'])
def diet():
    data = request.json
    food_item = data.get('food_item')
    
    if not food_item:
        return jsonify({"error": "Food item is required"}), 400
    
    prompt = f"Return a table containing macro breakdown of {food_item}. Table columns: Nutrient, Amount."
    response = palm.generate_text(prompt=prompt, temperature=0.5, max_output_tokens=1000)
    table = extract_markdown_table(response.result)
    
    return jsonify({
        "food_item": food_item,
        "macro_breakdown": table
    })

@app.route('/api/plan', methods=['POST'])
def plan():
    data = request.json
    user_id = data.get('user_id')
    
    # Get user data from Firebase
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()
    
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    
    # Calculate metrics
    bmi, _ = calculate_bmi(user_data)
    bmr, tdee = energy_calc(user_data)
    
    prompt = f"""
    Generate a diet plan for a {user_data['age']} year old {user_data['sex']}. 
    Ethnicity: {data.get('ethnicity', 'no preference')}
    Dietary restrictions: {'Vegan' if data.get('vegan', False) else 'None'}
    Preferences: {data.get('preferences', 'no specific preferences')}
    Goal: {user_data['goal']}
    BMR: {bmr}, TDEE: {tdee}, BMI: {bmi}
    Format as a table with: Mealtime, Food Item, Macro Breakdown
    """
    
    response = palm.generate_text(prompt=prompt, temperature=0.5, max_output_tokens=2000)
    plan_table = extract_markdown_table(response.result)
    
    # Save to user's plan history
    plan_ref = db.collection('plans').document()
    plan_ref.set({
        'user_id': user_id,
        'plan': plan_table,
        'created_at': firestore.SERVER_TIMESTAMP
    })
    
    return jsonify({
        "plan": plan_table,
        "plan_id": plan_ref.id
    })



@app.route('/api/advice', methods=['POST'])
def life_advice():
    user_id = request.json.get('user_id')
    
    # Get user data
    user_ref = db.collection('users').document(user_id)
    user_data = user_ref.get().to_dict()
    
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    
    # Calculate metrics
    bmi, bmi_class = calculate_bmi(user_data)
    bmr, tdee = energy_calc(user_data)
    
    prompt = f"""
    Provide comprehensive health advice for:
    - {user_data['age']} year old {user_data['sex']}
    - Height: {user_data['height']}m, Weight: {user_data['weight']}kg
    - Activity: {user_data['activity level']}
    - Goal: {user_data['goal']}
    - BMI: {bmi} ({bmi_class})
    - BMR: {bmr}, TDEE: {tdee}
    
    Include:
    1. General health recommendations
    2. Specific exercise suggestions
    3. Dietary advice
    4. Potential health risks
    5. Lifestyle tips
    """
    
    response = palm.generate_text(prompt=prompt, temperature=0.7, max_output_tokens=3000)
    
    return jsonify({
        "advice": response.result,
        "metrics": {
            "bmi": bmi,
            "bmi_class": bmi_class,
            "bmr": bmr,
            "tdee": tdee
        }
    })


if __name__ == '__main__':
    app.run(debug=True)