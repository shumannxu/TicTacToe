import { useEffect, useState } from "react";
import FirestoreWrapper from "../FirestoreWrapper";
import { Chat, UserId } from "../../../types";

const useMessages = (userId: UserId | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      const unsubscribe = FirestoreWrapper.onCollectionSnapshot(
        "chats",
        (chatsData: Chat[]) => {
          const userChats = chatsData.filter((chat) =>
            chat.users.includes(userId)
          );
          setChats(userChats);
          setLoading(false);
        },
        {
          fieldPath: "users",
          opStr: "array-contains",
          value: userId,
        }
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
      setChats([]);
    }
  }, [userId]);

  return { chats, loading };
};

export default useMessages;
