import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Button,
} from "react-native";
import { Chat, Message } from "../types"; // Assuming the types are defined in types.ts
import { useEffect, useRef, useState } from "react";
import { createChat, createMessage, getMessages } from "../firebase/db";
import useChatMessages from "../firebase/utils/hooks/useChats";
import Icon from "../components/icon";

interface MessageLogProps {
  chat: Chat;
}

const MessageLog: React.FC = ({ route, navigation }) => {
  const { chat, userId } = route.params;
  const { messages, loading } = useChatMessages(chat.chatId);
  const [message, setMessage] = useState<string>("");
  const messageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getMessages(chat.chatId);
        const sorted = messages.sort(
          (a: Message, b: Message) =>
            a.timestamp.getTime() - b.timestamp.getTime()
        );
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            ref={messageInputRef}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 5,
            }}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Button
            title="Send"
            onPress={() => {
              createMessage(chat.chatId, userId, message);
            }}
          />
        </View>
      </KeyboardAvoidingView>
      <ScrollView>
        {messages?.map((message: Message, index: number) => (
          <View key={message.messageId}>
            {message.sender !== userId && (
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                {message.sender}
              </Text>
            )}

            <View
              key={message.messageId}
              style={{
                alignSelf:
                  message.sender === userId ? "flex-end" : "flex-start",
                maxWidth: "70%",
                borderRadius: 99,
                padding: 13,
                backgroundColor: "#999",
              }}
            >
              <Text style={{ fontSize: 14, color: "black" }}>
                {message.value}
              </Text>
              <Text
                style={{ fontSize: 12, color: "#666", alignSelf: "flex-end" }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MessageLog;
