import firebase from "./firebase.js";

// it's created in the Firebase console for the project
// Project settings -> Cloud Messaging -> Web Push certificates -> Generate Key pair
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const notificationsSupported = "Notification" in window && navigator.serviceWorker;

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
  // resolve the "waiting promise"

  console.log("Check create/created subscription");

  return createSubscription(swReg);
}

/**
 * Request/Check permission to use Notification API and if granted configure Push Notifications.
 */
function createSubscription(swReg: ServiceWorkerRegistration): Promise<void> {
  // this will also return current returned Push subscription if any
  // Permissions and subscribe() has been "allowed"
  // There is one side effect of calling subscribe(). If your web app doesn't have permissions for showing notifications
  // at the time of calling subscribe(), the browser will request the permissions for you.
  // This is useful if your UI works with this flow, but if you want more control  stick to the Notification.requestPermission() API.
  return swReg.pushManager
    .subscribe({
      // The userVisibleOnly parameter is basically an admission that you will show a notification every time a push is sent.
      // At the time of writing this value is required and must be true.
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(vapidPublicKey!),
    })
    .then((subscription) => {
      console.log("User IS subscribed.");

      updateSubscriptionOnServer(swReg, subscription);
    })
    .catch((error) => {
      console.error("User is NOT subscribed because of", error);
      throw error; // rethrow the same rejected error
    });
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

/**
 * Update user's subscription on the server - add new, remove old
 */
async function updateSubscriptionOnServer(swReg: ServiceWorkerRegistration, subscription: PushSubscription) {
  // TODO: send newSubscription to server if the common Valid `web-push` is used
  console.log(subscription);

  // TODO: send fcmToken to server if the `firebase-admin` is used
  const fcmToken = await firebase.getMassagingToken(swReg, vapidPublicKey!);
  console.log(fcmToken);
}
