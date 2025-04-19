import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const PlanPage: React.FC = () => {
  const [preferences, setPreferences] = useState('');
  const [plan, setPlan] = useState('');

  const handleGetPlan = async () => {
    if (!preferences.trim()) {
      Alert.alert('Error', 'Preferences cannot be empty');
      return;
    }

    try {
      const response = await axios.post('/api/plan', { preferences });
      setPlan(response.data.plan);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Preferences"
        style={styles.input}
        onChangeText={setPreferences}
      />
      <Button title="Get Plan" onPress={handleGetPlan} />
      {plan ? <Text style={styles.result}>{plan}</Text> : null}
    </View>
  );
};

export default PlanPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  result: { marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
});
