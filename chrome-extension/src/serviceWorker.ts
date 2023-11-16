import { GEO, MESSAGE_TYPE, OFFSCREEN_DOCUMENT_PATH, OFFSCREEN_TAB } from "./lib/utils";

import { addDevice, removeDevice, reportDeviceGEO } from "./lib/firebase";
import { storageDeviceName } from "./lib/storage";

let NOTIFICATION_ID = 0;

// it "populated" by Webpack DefinePlugin and taken from env variable
declare var FIREBASE_SENDER_ID: string;

declare var self: ServiceWorkerGlobalScope;

let offscreenCreating: Promise<void> | undefined; // A global promise to avoid concurrency issues

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
chrome.runtime.onMessage.addListener(messageReceived);

// Set up listeners to trigger the first time registration.
// chrome.runtime.onInstalled.addListener(gcmRegister);
// chrome.runtime.onStartup.addListener(gcmRegister);

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(gcmMessageReceived);

function gcmRegister({
  deviceName,
  oldDeviceName,
}: {
  deviceName?: string;
  oldDeviceName?: string;
}) {
  // chrome.app.window.create(
  //   "register.html",
  //   {  width: 500,
  //      height: 400,
  //      frame: 'chrome'
  //   },
  //   function(appWin) {}
  // );

  // unregister old
  if (oldDeviceName) {
    removeDevice({ name: oldDeviceName }).catch((error) => {
      console.error(`Failed to unregister device ${oldDeviceName}`, error);
    });
  }

  // register new device
  if (deviceName) {
    chrome.gcm.register([FIREBASE_SENDER_ID], (regId) => {
      if (chrome.runtime.lastError) {
        // When the registration fails, handle the error and retry the
        // registration later.
        showNotification("GCM-Registration failed: " + chrome.runtime.lastError.message);
        return;
      }

      addDevice({
        userAgent: navigator.userAgent,
        gcm: regId,
        name: deviceName,
      })
        .then((result) => {
          // mark that this device registration is done.
          storageDeviceName.set(deviceName);

          showNotification(`Device registered: ${deviceName} - ${regId}`);
        })
        .catch((error) => {
          console.error(`Failed to add/register device ${deviceName}`, error);
        });
    });
  }
}

async function gcmMessageReceived(message: chrome.gcm.IncomingMessage) {
  // A message is an object with a 'data' property that consists of key-value pairs.

  console.log("Message received:", JSON.stringify(message.data));

  if ((<any>message.data).type === MESSAGE_TYPE.GEO) {
    try {
      const geo = await getGeolocation();
      console.log("GEO location received: ", geo);
      
      storageDeviceName.get((deviceName) => reportDeviceGEO({ name: deviceName, geo }));

      // show notification to show the GEO location
      showNotification("GEO:" + JSON.stringify(geo));
    } catch (error: unknown) {
      console.log("GEO location failed: ", (<Error>error).message);
      console.error(error);
      showNotification("GEO failed:" + JSON.stringify(error));
    }
  }
}

function showNotification(messageStr: string) {
  chrome.notifications.create(
    "" + NOTIFICATION_ID++,
    {
      title: "MaPhone (extension)",
      iconUrl: "images/notification.png",
      type: "basic",
      message: messageStr,
    },
    () => {},
  );
}

function messageReceived(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  const { type, data } = message;

  console.log(`Received message ${type} : ${JSON.stringify(data)}.`);

  switch (type) {
    // demo
    case "GREETINGS":
      sendResponse({
        message: `Hi ${sender.tab ? "Content" : "Popup"}. I am from Background.`,
      });
      break;

    case MESSAGE_TYPE.REGISTER:
      sendResponse({});
      gcmRegister(data);
      break;
  }
}

async function getGeolocation(): Promise<GEO> {
  await setupOffscreenDocument();
  const geolocation: GEO = await chrome.runtime.sendMessage({
    type: MESSAGE_TYPE.GEO,
    target: OFFSCREEN_TAB,
  });
  await closeOffscreenDocument();
  return geolocation;
}

async function hasOffscreenDocument(): Promise<boolean> {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const matchedClients = await self.clients.matchAll();
  return matchedClients.some((c) => c.url === offscreenUrl);
}

async function closeOffscreenDocument() {
  if (!(await hasOffscreenDocument())) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

async function setupOffscreenDocument() {
  //if we do not have a document, we are already setup and can skip
  if (!(await hasOffscreenDocument())) {
    // create offscreen document
    if (offscreenCreating) {
      await offscreenCreating;
    } else {
      offscreenCreating = chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.GEOLOCATION || chrome.offscreen.Reason.DOM_SCRAPING],
        justification: "geolocation access",
      });

      await offscreenCreating;
      offscreenCreating = undefined;
    }
  }
}
