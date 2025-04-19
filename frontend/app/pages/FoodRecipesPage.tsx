import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

interface FoodRecipesPageProps {}

const FoodRecipesPage: React.FC<FoodRecipesPageProps> = () => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'image/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while picking the document.');
    }
  };

  const handleUpload = async () => {
    if (!file?.assets || file.assets.length === 0) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    const fileInfo = file.assets[0];
    const fileUri = fileInfo.uri;
    const fileName = fileInfo.name || 'file.jpg';
    const fileType = fileInfo.mimeType || 'image/jpeg';

    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, fileName); // Append the Blob with a filename

      // Use a complete URL if your API is hosted, or adjust the relative path accordingly
      const uploadResponse = await axios.post('https://your-api-url/api/food_recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Recipes', JSON.stringify(uploadResponse.data?.recipes));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred during upload');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick File" onPress={handleFilePick} />
      <Button title="Upload and Get Recipes" onPress={handleUpload} disabled={!file} />
    </View>
  );
};

export default FoodRecipesPage;

const styles = StyleSheet.create({
  container: { padding: 20 },
});