import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';

export default function Onboarding() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <Image 
        source={require('../assets/images/onboarding.jpg')} 
        style={{ width: 300, height: 300, marginBottom: 24 }}
      />
      
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, width: '90%' }}>
        Welcome to Your Virtual Diabetes Guide
      </Text>
      <Text style={{ textAlign: 'center', color: 'gray', marginBottom: 32, width: '90%' }}>
        Empowering you with knowledge, tracking tools, and personalized insights for better diabetes management.
      </Text>
      
      <View style={{ width: '90%', position: 'absolute', bottom: 50 }}>
        <TouchableOpacity 
          style={{ backgroundColor: 'black', paddingVertical: 16, borderRadius: 12, marginBottom: 10 }} 
          onPress={() => router.push('/signup')}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ borderWidth: 1, borderColor: 'gray', paddingVertical: 16, borderRadius: 12 }} 
          onPress={() => router.push('/signin')}
        >
          <Text style={{ color: 'black', textAlign: 'center', fontWeight: '600', fontSize: 18 }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}