import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native'; // Ensure Text is imported
import axios from 'axios';

interface DietPageProps {}

const DietPage: React.FC<DietPageProps> = () => {
  const [foodItem, setFoodItem] = useState('');
  const [macros, setMacros] = useState('');

  const handleGetMacros = async () => {
    if (!foodItem.trim()) {
      Alert.alert('Error', 'Food item cannot be empty');
      return;
    }

    try {
      const response = await axios.post('/api/diet', { food_item: foodItem });
      setMacros(JSON.stringify(response.data.macros, null, 2));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Food Item"
        style={styles.input}
        onChangeText={setFoodItem}
      />
      <Button title="Get Macro Breakdown" onPress={handleGetMacros} />
      {macros ? <Text style={styles.result}>{macros}</Text> : null}
    </View>
  );
};

export default DietPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  result: { marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
});