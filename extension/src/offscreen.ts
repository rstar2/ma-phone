import { GEO, MESSAGE_TYPE, OFFSCREEN_TAB } from "./utils";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Return early if this message isn't meant for the offscreen document.
  // Note when the serviceWorker sends messages it sends the message to all the listeners in the runtime
  if (message.target !== OFFSCREEN_TAB)
    return;

  if (message.type !== MESSAGE_TYPE.GEO) {
    console.warn(`Unexpected message type received: '${message.type}'.`);
    return;
  }

  // You can directly respond to the message from the service worker with the
  // provided `sendResponse()` callback. But in order to be able to send an async
  // response, you need to explicitly return `true` in the onMessage handler
  // As a result, you can't use async/await here. You'd implicitly return a Promise.
  getLocation().then((loc) => sendResponse(loc));

  return true;
});

async function getLocation(): Promise<GEO> {
  // Use a raw Promise here so you can pass `resolve` and `reject` into the
  // callbacks for getCurrentPosition().
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        // getCurrentPosition() returns a prototype-based object, so the properties
        // end up being stripped off when sent to the service worker. To get
        // around this, create a plain object.
        resolve({
          longitude: loc.coords.longitude,
          latitude: loc.coords.latitude,
          accuracy: loc.coords.accuracy,
        });
      },
      // in case the user doesn't have/is blocking `geolocation`
      (err) => reject(err),
    );
  });
}
