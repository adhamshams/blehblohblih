import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const DiabetesCheckPage: React.FC = () => {
  const [userId, setUserId] = useState('');

  const handleCheck = async () => {
    try {
      const response = await axios.post('/api/diabetes_check', { user_id: userId });
      Alert.alert('Diabetes Check', response.data.prediction === 'yes' ? 'Positive' : 'Negative');
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
      <Button title="Check for Diabetes" onPress={handleCheck} />
    </View>
  );
};

export default DiabetesCheckPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
});
