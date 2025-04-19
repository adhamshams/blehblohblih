import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

interface UserForm {
  user_id: string;
  [key: string]: string;
}

const UserPage: React.FC = () => {
  const [userData, setUserData] = useState<UserForm>({ user_id: '' });

  const handleSave = async () => {
    try {
      const response = await axios.post('/api/user', userData);
      Alert.alert('Success', response.data.message);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter User ID"
        style={styles.input}
        onChangeText={(text) => setUserData({ ...userData, user_id: text })}
      />
      <Button title="Save User Data" onPress={handleSave} />
    </View>
  );
};

export default UserPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
});
