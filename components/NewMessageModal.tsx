import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  InputAccessoryView,
  Button,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { createChat } from "../firebase/db";
import { UserId } from "../types";

// Define the types for the props
interface NewMessageModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  userId: UserId;
}

// Accept modalVisible and setModalVisible as props with TypeScript types
export default function NewMessageModal({
  modalVisible,
  setModalVisible,
  userId,
}: NewMessageModalProps) {
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("Hello");
  const inputAccessoryViewID = "keyboard-unique";
  const messageInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (modalVisible) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [modalVisible]);

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <SafeAreaView style={{ marginTop: 22 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                New Message
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                <Text style={{ fontSize: 16, color: "#007aff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 10 }}>To:</Text>
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  borderRadius: 5,
                }}
                placeholder="Enter recipient..."
                value={recipient}
                onChangeText={setRecipient}
              />
            </View>
          </View>
        </SafeAreaView>
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
                createChat([recipient], "New Chat", message, userId);
                setModalVisible(false);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
