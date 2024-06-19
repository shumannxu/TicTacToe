import { ChatId, Message, MessageId, UserId } from "../types";
import FirestoreWrapper from "./utils/FirestoreWrapper";

export async function createChat(
  users: UserId[],
  name: string,
  initialMessageValue: string,
  sender: UserId
): Promise<ChatId | null> {
  try {
    // Ensure the sender is included in the users array
    if (!users.includes(sender)) {
      users.push(sender);
    }

    const chatId = await FirestoreWrapper.createDocument("chats", {
      users,
      name,
    });

    if (chatId) {
      await FirestoreWrapper.createDocument("messages", {
        chatId,
        sender,
        value: initialMessageValue,
        timestamp: new Date(),
        seen: false,
      });
    }

    return chatId;
  } catch (error) {
    console.error("Failed to create chat:", error);
    return null;
  }
}
export async function createMessage(
  chatId: ChatId,
  sender: UserId,
  value: string
): Promise<MessageId | null> {
  try {
    const messageId = await FirestoreWrapper.createDocument("messages", {
      chatId,
      sender,
      value,
      timestamp: new Date(),
      seen: false,
    });
    return messageId;
  } catch (error) {
    console.error("Failed to create message:", error);
    return null;
  }
}

export async function deleteChat(chatId: ChatId): Promise<boolean> {
  try {
    // Delete all messages associated with the chat
    const messages = await FirestoreWrapper.getCollection("messages", [
      { fieldPath: "chatId", opStr: "==", value: chatId },
    ]);

    for (const message of messages) {
      await FirestoreWrapper.deleteDocument("messages", message.id);
    }

    // Delete the chat itself
    await FirestoreWrapper.deleteDocument("chats", chatId);

    return true;
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return false;
  }
}

export async function getMessages(chatId: ChatId): Promise<Message[]> {
  try {
    const messages = await FirestoreWrapper.getCollection("messages", [
      { fieldPath: "chatId", opStr: "==", value: chatId },
    ]);

    const messagesWithConvertedTimestamps = messages.map((message) => ({
      ...message,
      timestamp: message.timestamp.toDate(),
    }));

    return messagesWithConvertedTimestamps;
  } catch (error) {
    console.error("Failed to retrieve messages for chatId:", chatId, error);
    return [];
  }
}
