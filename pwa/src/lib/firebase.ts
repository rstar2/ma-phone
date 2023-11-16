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
import { getFunctions, httpsCallable, Functions, HttpsCallable } from "firebase/functions";
import { getMessaging, getToken, type Messaging } from "firebase/messaging";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

class Firebase {
  private readonly db: Firestore;
  private readonly functions: Functions;
  private readonly messaging: Messaging;

  constructor(firebaseConfig: FirebaseConfig) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    this.db = getFirestore(app);
    this.functions = getFunctions(app);
    this.messaging = getMessaging(app);
  }

  // ---------- Functions ------------

  /**
   * Get a HTTP callable function
   * @param {string} nameFn
   */
  httpsCallable(nameFn: string): HttpsCallable {
    return httpsCallable(this.functions, nameFn);
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

  // ---------- FCM messaging (web push notifications) ------------

  /**
   * Should be called after showing notification is "granted"
   */
  async getMassagingToken(swReg: ServiceWorkerRegistration, vapidKey: string) {
    return getToken(this.messaging, {
      serviceWorkerRegistration: swReg,
      vapidKey,
    });
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
