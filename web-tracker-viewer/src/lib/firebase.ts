import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  Firestore,
  CollectionReference,
  Query,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

class Firebase {
  private readonly db: Firestore;

  constructor(firebaseConfig: FirebaseConfig) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    this.db = getFirestore(app);
  }

  // ---------- Firestore ------------

  collection(nameCol: string): CollectionReference {
    return collection(this.db, nameCol);
  }

  async getDocs(query: Query): Promise<QuerySnapshot> {
    return getDocs(query);
  }

  onSnapshot(query: Query, onNext: (snapshot: QuerySnapshot) => void): Unsubscribe {
    return onSnapshot(query, onNext);
  }

  onSnapshotCollection(nameCol: string, onNext: (snapshot: QuerySnapshot) => void): Unsubscribe {
    return onSnapshot(collection(this.db, nameCol), onNext);
  }

}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID!,
  appId: import.meta.env.VITE_FIREBASE_APP_ID!,
};

// create instance of the firebase service
export default new Firebase(firebaseConfig);

export type Doc = Readonly<{
    id: string;
    [key: string]: unknown;
  }>;
/**
 * Parse all users/activities
 */
export const parseDocs = <T extends Doc>(snapshot: QuerySnapshot): T[] => {
    const docs: T[] = [];
    snapshot.forEach((doc) => {
      docs.push({ id: doc.id, ...doc.data() } as T);
    });
    return docs;
  };
