import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const AdvicePage: React.FC = () => {
  const [advice, setAdvice] = useState('');

  const handleGetAdvice = async () => {
    try {
      const response = await axios.get('/api/advice');
      setAdvice(response.data.advice);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Get Health Advice" onPress={handleGetAdvice} />
      {advice ? <Text style={styles.result}>{advice}</Text> : null}
    </View>
  );
};

export default AdvicePage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  result: { marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
});
