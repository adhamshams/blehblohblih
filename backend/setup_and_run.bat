@echo off
echo Checking Python version...
python --version

echo Installing Python 3.10 if needed...
# If you already have Python 3.10, you can skip this step
# If Python 3.10 is not installed, the script won't proceed unless you manually install it.

echo Creating virtual environment with Python 3.10...
# Make sure you use the path to Python 3.10 installed on your system
C:\Users\kingc\AppData\Local\Programs\Python\Python310\python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
pip install --upgrade pip

echo Installing dependencies...
pip install -r requirements.txt

echo Running app.py...
python app.py





