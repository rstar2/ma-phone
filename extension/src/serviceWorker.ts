import {
  GEO,
  MESSAGE_TYPE,
  OFFSCREEN_DOCUMENT_PATH,
  OFFSCREEN_TAB,
  STORAGE_KEY_GCM_REGISTERED,
} from "./utils";

let NOTIFICATION_ID = 0;

// it "populated" by Webpack DefinePlugin and taken from env variable
declare var SENDER_ID: string;

declare var self: ServiceWorkerGlobalScope;

let offscreenCreating: Promise<void> | undefined; // A global promise to avoid concurrency issues

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
chrome.runtime.onMessage.addListener(messageReceived);

// Set up listeners to trigger the first time registration.
chrome.runtime.onInstalled.addListener(gcmRegister);
chrome.runtime.onStartup.addListener(gcmRegister);

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(gcmMessageReceived);

function gcmRegister() {
  chrome.storage.local.get(STORAGE_KEY_GCM_REGISTERED, (result) => {
    // If already registered, bail out.
    if (result[STORAGE_KEY_GCM_REGISTERED]) return;

    // chrome.app.window.create(
    //   "register.html",
    //   {  width: 500,
    //      height: 400,
    //      frame: 'chrome'
    //   },
    //   function(appWin) {}
    // );
  });

  chrome.gcm.register([SENDER_ID], (regId) => {
    if (chrome.runtime.lastError) {
      // When the registration fails, handle the error and retry the
      // registration later.
      showNotification("Registration failed: " + chrome.runtime.lastError.message);
      return;
    }
    showNotification("Registration success: " + regId);
    console.log("??? " + regId);

    // Mark that the first-time registration is done.
    // chrome.storage.local.set({ [STORAGE_KEY_GCM_REGISTERED]: true });
  });
}

async function gcmMessageReceived(message: chrome.gcm.IncomingMessage) {
  // A message is an object with a 'data' property that consists of key-value pairs.

  console.log("Message received:", JSON.stringify(message.data));

  if ((<any>message.data).type === MESSAGE_TYPE.GEO) {
    const geo = await getGeolocation();
    console.log("GEO location received: ", geo);
    // show notification to show the GEO location
    showNotification("GEO:" + JSON.stringify(geo));
  }
}

function showNotification(messageStr: string) {
  chrome.notifications.create(
    "" + NOTIFICATION_ID++,
    {
      title: "MaPhone Message",
      iconUrl: "images/gcm_128.png",
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
  if (message.type === "GREETINGS") {
    const messageStr: string = `Hi ${
      sender.tab ? "Con" : "Pop"
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(message.data.message);

    // Send a response message
    sendResponse({
      message: messageStr,
    });
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
