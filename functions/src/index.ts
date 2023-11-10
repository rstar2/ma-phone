import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
initializeApp();

// const db = getFirestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((req, res) => {
  // Grab the text parameter.
  const text = req.query.text;
  logger.info(`Hi ${text}`, { structuredData: true });
  //   res.send("Hello!!!");
  res.json({ result: `Message: ${text}` });
});
