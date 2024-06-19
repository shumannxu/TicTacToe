import React, { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Timestamp } from "firebase/firestore";
import { BoardValue, Game, GameId, GameOutcome, UserId } from "../types";
import uuid from "react-native-uuid";
import LottieView from "lottie-react-native";
import NewMessageModal from "../components/NewMessageModal"; // Import the NewMessageModal component
import useMessages from "../firebase/utils/hooks/useMessages";
import useConversation from "../firebase/utils/hooks/useConversation";
import Icon from "../components/icon";
import { useNavigation } from "@react-navigation/native";
import { deleteChat } from "../firebase/db";

export default function HomeScreen({ navigation }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // State to control the visibility of the modal
  const [editMode, setEditMode] = useState<boolean>(false);

  const { chats, loading } = useMessages(userId);
  const { lastMessages, loadingMessage } = useConversation(chats ?? []);
  console.log(userId);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          const newUserId = uuid.v4().toString();
          await AsyncStorage.setItem("userId", newUserId);
          setUserId(newUserId);
        }
      } catch (error) {
        console.error("Failed to fetch or generate user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setEditMode(!editMode)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Create Chat</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Messages</Text>
        <TextInput style={styles.searchBox} placeholder="Search..." />
        <FlatList
          data={chats}
          keyExtractor={(item, index) => item.chatId}
          renderItem={({ item, index }) =>
            lastMessages.length === chats.length && (
              <TouchableOpacity
                style={styles.messageItem}
                onPress={() =>
                  navigation.navigate("MessageLog", {
                    chat: item,
                    userId: userId,
                  })
                }
              >
                <View>
                  <Icon color={"#007aff"}>profile</Icon>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.messageUser}>
                    {item.name ?? item.users}
                  </Text>
                  <Text style={styles.messageValue}>
                    {lastMessages[index]?.value}
                  </Text>
                </View>
                {editMode && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteChat(item.chatId)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.messageTimestamp}>
                  {new Date(lastMessages[index]?.timestamp)?.toLocaleString()}
                </Text>
              </TouchableOpacity>
            )
          }
          style={{ flex: 1 }} // Ensure the FlatList takes up the remaining space
        />
      </SafeAreaView>
      <NewMessageModal
        userId={userId ?? ""}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      {/* Include the modal in the component tree */}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // Light gray background similar to iMessage
  },
  editButtonText: {
    color: "#007aff",
  },
  deleteButton: {
    padding: 10,
    borderRadius: 5,
    color: "#999", // Grey for timestamps
    marginLeft: 5,
    position: "absolute",
    alignItems: "center",
    right: 5,
  },
  deleteButtonText: {
    color: "red", // White text for delete button
    fontWeight: "bold",
  },
  innerContainer: {
    // justifyContent: "center",
    // alignItems: "center",
    marginHorizontal: 20,
    flex: 1, // Ensure the inner container takes up the full height
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff", // White header
  },
  headerButton: {
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000", // Black text for title
  },
  searchBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  messageItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff", // White background for each message item
  },
  messageUser: {
    fontWeight: "bold",
    color: "black", // Blue text for user names
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#999", // Grey for timestamps
    marginLeft: 5,
    position: "absolute",
    top: 5,
    right: 5,
  },
  messageValue: {
    marginTop: 5,
    fontSize: 15,
    color: "#999", // Black for message text
  },
});
