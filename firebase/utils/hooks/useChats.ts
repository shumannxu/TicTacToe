import { useEffect, useState } from "react";
import { Message } from "../../../types";
import FirestoreWrapper from "../FirestoreWrapper";

const useChatMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = FirestoreWrapper.onCollectionSnapshot(
      "messages",
      (messagesData: Message[]) => {
        const sortedMessages = messagesData.sort(
          (a, b) =>
            a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
        );
        const messagesWithConvertedTimestamps = sortedMessages.map(
          (message) => ({
            ...message,
            timestamp: message.timestamp.toDate(),
          })
        );
        setMessages(messagesWithConvertedTimestamps);
        setLoading(false);
      },
      {
        fieldPath: "chatId",
        opStr: "==",
        value: chatId,
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  return { messages, loading };
};

export default useChatMessages;
