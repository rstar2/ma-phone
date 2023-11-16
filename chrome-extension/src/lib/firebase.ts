import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

// TODO: use env variables (e.g. DefinePlugin)
// config after registering firebase App
const config = {
  apiKey: "AIzaSyDdaS5no1a0DtQaJBpeaymCeSPadgRX7uY",
  authDomain: "ma-phone-81020.firebaseapp.com",
  projectId: "ma-phone-81020",
  storageBucket: "ma-phone-81020.appspot.com",
  messagingSenderId: "83025117279",
  appId: "1:83025117279:web:6dbb611e6972188d339bea",
};
const app = initializeApp(config);

const functions = getFunctions(app);

export const addDevice = httpsCallable(functions, "addDevice");
export const removeDevice = httpsCallable(functions, "removeDevice");
export const reportDeviceGEO = httpsCallable(functions, "reportDeviceGEO");
