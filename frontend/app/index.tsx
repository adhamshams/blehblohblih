import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          Virtual Diabetes Guide
        </Text>
        <Text style={{ fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 24 }}>
          Navigate through the features of the app below:
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/AdvicePage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Advice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/CalculateMetricsPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Calculate Metrics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/ChatPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/DiabetesCheckPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Diabetes Check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/DietPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Diet Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/FoodRecipesPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Food Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/PlanPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/UserPage')}
        >
          <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>User Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            marginBottom: 12,
          }}
          onPress={() => router.push('/signin')}
        >
          <Text style={{ color: 'black', fontSize: 18, textAlign: 'center' }}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'black',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
          onPress={() => router.push('/signup')}
        >
          <Text style={{ color: 'black', fontSize: 18, textAlign: 'center' }}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
