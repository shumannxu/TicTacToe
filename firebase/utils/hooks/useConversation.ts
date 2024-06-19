import { useEffect, useState } from "react";
import FirestoreWrapper from "../FirestoreWrapper";
import { Chat, Message, UserId } from "../../../types";
import { getMessages } from "../../db";

const useConversation = (chats: Chat[]) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userChats, setUserChats] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const messagesPromises = chats.map((chat) => getMessages(chat.chatId));
        const messagesArrays = await Promise.all(messagesPromises);
        console.log(messagesArrays);
        const chatsWithLastMessage = messagesArrays.map((messages) => {
          const lastMessage = messages.reduce((prev, current) => {
            return prev.timestamp > current.timestamp ? prev : current;
          }, messages[0]);
          return lastMessage;
        });
        setUserChats(chatsWithLastMessage);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [chats]);

  return { lastMessages: userChats, loadingMessage: loading };
};
export default useConversation;
