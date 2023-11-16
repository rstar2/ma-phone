import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

// these are "populated" by Webpack DefinePlugin and taken from env variable
declare var FIREBASE_API_KEY: string;
declare var FIREBASE_AUTH_DOMAIN: string;
declare var FIREBASE_PROJECT_ID: string;
declare var FIREBASE_SENDER_ID: string;
declare var FIREBASE_APP_ID: string;

// config after registering firebase App
const config = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  messagingSenderId: FIREBASE_SENDER_ID,
  appId: FIREBASE_APP_ID,
};
const app = initializeApp(config);

const functions = getFunctions(app);

export const addDevice = httpsCallable(functions, "addDevice");
export const removeDevice = httpsCallable(functions, "removeDevice");
export const reportDeviceGEO = httpsCallable(functions, "reportDeviceGEO");
