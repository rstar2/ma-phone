import { logger } from "firebase-functions";
import { onRequest, onCall } from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { prune } from "./utils";

initializeApp();

const db = getFirestore();

const COLLECTION_DEVICES = "devices";
const COLLECTION_LOCATIONS = "locations";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((req, res) => {
  // Grab the text parameter.
  const text = req.query.text;
  logger.info(`Hi ${text}`, { structuredData: true });
  //   res.send("Hello!!!");
  res.json({ result: `Message: ${text}` });
});

exports.addDevice = onCall((request) => {
  logger.info("New device registering ...");

  // get data from the client
  const { name, ...props } = request.data;

  // returning a Promise will make the function async and keep it running until the promise is resolved
  return db
    .collection(COLLECTION_DEVICES)
    .doc(name) // store them with the name as ID, bonus is that if such name already exist it will throw
    .set(
      prune({
        ...props,
        name,
      })
    )
    .then(() => {
      logger.info("New device registered");
      // returning a message to the client.
      return { message: "Success" };
    });
});

exports.removeDevice = onCall((request) => {
  logger.info("Old device registering ...");

  // get data from the client
  const { name } = request.data;

  // returning a Promise will make the function async and keep it running until the promise is resolved
  // return db
  //   .collection(COLLECTION_DEVICES)
  //   .limit(1)
  //   .where('name', '==', name)
  //   .get()
  //   .then(() => {
  //     logger.info("New device registered");
  //     // returning a message to the client.
  //     return { message: "Success" };
  //   });

  // if the name is also used as ID
  return db
    .collection(COLLECTION_DEVICES)
    .doc(name)
    .delete()
    .then(() => {
      logger.info("Old device unregistered");
      // returning a message to the client.
      return { message: "Success" };
    });
});

exports.reportDeviceGEO = onCall((request) => {
  // get data from the client
  const { name, geo } = request.data;

  if (!name || !geo) throw new Error("Invalid device GEO data");

  // sometimes the clients may report empty GEO data so skip these cases
  if (!Object.keys(geo).length) {
    logger.info("Skip report device GEO as it's empty");
    return;
  }

  logger.info("Report device GEO ...");

  return db
    .collection(COLLECTION_LOCATIONS)
    .add({
      name,
      timestamp: new Date(),
      geo,
    })
    .then(() => {
      logger.info("Tracked device's GEO");
      // returning a message to the client.
      return { message: "Success" };
    });
});
