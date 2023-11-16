import { Deferred } from "ts-deferred";
import firebase from "./firebase";

// it's created in the Firebase console for the project
// Project settings -> Cloud Messaging -> Web Push certificates -> Generate Key pair
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const notificationsSupported = "Notification" in window && navigator.serviceWorker;

const IS_FIREBASE_MESSAGING = true;

// Using Deferred allows to decouple the time when push-notifications are configured and when needed to send to the server
const deferredFCMToken = new Deferred<string>();
const deferredPushSubscription = new Deferred<PushSubscription>();

/**
 * This must be called (and thus configured) before
 * any "other" module importing the other exported functions
 */
export default async function config(swReg?: ServiceWorkerRegistration) {
  if (!notificationsSupported) {
    console.warn("Client Notifications not supported");
    new Error("Client Notifications not supported");
  }

  if (!swReg) {
    console.warn("Push Messaging is not available");
    throw new Error("Push Messaging is not available");
  }

  if (!vapidPublicKey) {
    console.warn("Push Messaging is not configured");
    throw new Error("Push Messaging is not configured");
  }

  console.log("Configure Push Notifications");

  // check if using the Firebase messaging service or plain VAPID subscription
  return IS_FIREBASE_MESSAGING ? createFCMToken(swReg) : createSubscription(swReg);
}

/**
 * Request/Check permission to use Notification API and if granted configure Push Notifications
 * and create a FCM token - it can be used with "firebase-admin" in the server for sending messages to it
 */
async function createFCMToken(swReg: ServiceWorkerRegistration): Promise<void> {
  try {
    const fcmToken = await firebase.getMassagingToken(swReg, vapidPublicKey!);

    console.log("FCMToken:", fcmToken);
    deferredFCMToken.resolve(fcmToken);
  } catch (error) {
    deferredFCMToken.reject(error);
  }
}

/**
 * Request/Check permission to use Notification API and if granted configure Push Notifications
 * and create a plain subscription - it can be used with "web-push" in the server for sending messages to it
 */
async function createSubscription(swReg: ServiceWorkerRegistration): Promise<void> {
  try {
    // this will also return current returned Push subscription if any
    // Permissions and subscribe() has been "allowed"
    // There is one side effect of calling subscribe(). If your web app doesn't have permissions for showing notifications
    // at the time of calling subscribe(), the browser will request the permissions for you.
    // This is useful if your UI works with this flow, but if you want more control  stick to the Notification.requestPermission() API.
    const subscription = await new Promise((resolve: (subs: PushSubscription) => void, reject) => {
      swReg.pushManager
        .subscribe({
          // The userVisibleOnly parameter is basically an admission that you will show a notification every time a push is sent.
          // At the time of writing this value is required and must be true.
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(vapidPublicKey!),
        })
        .then(resolve)
        .catch(reject);
    });

    console.log("PushSubscription:", subscription);
    deferredPushSubscription.resolve(subscription);
  } catch (error) {
    deferredPushSubscription.reject(error);
  }
}

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getFCMToken(): Promise<string> {
  return deferredFCMToken.promise;
}

export async function getPushSubscription(): Promise<PushSubscription> {
  return deferredPushSubscription.promise;
}
