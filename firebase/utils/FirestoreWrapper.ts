import { firestore } from "../../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

class FirestoreWrapper {
  static createDocument = async (
    collectionPath: string,
    data: any
  ): Promise<string> => {
    const docRef = doc(collection(firestore, collectionPath));
    await setDoc(docRef, data);
    return docRef.id;
  };

  static updateDocument = async (
    collectionPath: string,
    docId: string,
    data: any
  ): Promise<void> => {
    const docRef = doc(firestore, collectionPath, docId);
    await setDoc(docRef, data, { merge: true });
  };

  static getDocument = async (
    collectionPath: string,
    docId: string
  ): Promise<any> => {
    const docRef = doc(firestore, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  static getCollection = async (
    collectionPath: string,
    queryConstraints: Array<{ fieldPath: string; opStr: any; value: any }>
  ): Promise<any[]> => {
    const collectionRef = collection(firestore, collectionPath);
    const constraints = queryConstraints.map((constraint) =>
      where(constraint.fieldPath, constraint.opStr, constraint.value)
    );
    const queryRef = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

  static deleteDocument = async (
    collectionPath: string,
    docId: string
  ): Promise<void> => {
    await deleteDoc(doc(firestore, collectionPath, docId));
  };

  static onCollectionSnapshot = (
    collectionPath: string,
    callback: (data: any[]) => void,
    queryConstraints: { fieldPath: string; opStr: any; value: any }
  ): (() => void) => {
    let collectionRef = collection(firestore, collectionPath);
    const { fieldPath, opStr, value } = queryConstraints;
    const queryRef = query(collectionRef, where(fieldPath, opStr, value));

    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        chatId: doc.id,
      }));
      callback(data);
    });
    return unsubscribe;
  };
}

export default FirestoreWrapper;
