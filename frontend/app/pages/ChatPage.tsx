import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

interface ChatMessage {
  user: string;
  bot: string;
}

const ChatPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      const response = await axios.post('/api/chat', { message: input });
      const newMessage: ChatMessage = { user: input, bot: response.data.reply };
      setMessages([...messages, newMessage]);
      setInput('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messages}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.message}>
            <Text>User: {msg.user}</Text>
            <Text>Bot: {msg.bot}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput
        placeholder="Type your message"
        style={styles.input}
        value={input}
        onChangeText={setInput}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  messages: { flex: 1, marginBottom: 10 },
  message: { marginBottom: 5, padding: 10, borderWidth: 1, borderRadius: 5 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
});
