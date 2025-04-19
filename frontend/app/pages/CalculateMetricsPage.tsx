import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const CalculateMetricsPage: React.FC = () => {
  const [userId, setUserId] = useState('');

  const handleCalculate = async () => {
    try {
      const response = await axios.post('/api/calculate_metrics', { user_id: userId });
      Alert.alert('Metrics Calculated', JSON.stringify(response.data));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter User ID"
        style={styles.input}
        onChangeText={(text) => setUserId(text)}
      />
      <Button title="Calculate Metrics" onPress={handleCalculate} />
    </View>
  );
};

export default CalculateMetricsPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
});
