// NOTE: it a valid TypeScript file
/// <reference lib="webworker" />

// export type {}; // needed if no "import ..." in order to assume this file as module

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare const self: ServiceWorkerGlobalScope;

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { MESSAGE_TYPE } from "./lib/utils";
import notificationImage from "./assets/notification.png";

// Caching --------------------------

// static cache of the assets defined in in vite.config.ts `workbox.globPatterns: ["**/*.{js,css,html,ico,png,svg}"]`
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Auto Update Behavior --------------------------

// in `vite.config.ts` it is `registerType: "autoUpdate"`
self.skipWaiting();
clientsClaim();

// Receive push notifications --------------------------

self.addEventListener("push", async function (e) {
  if (!e.data) return;

  console.log("Received PushNotification");

  // assuming data is in plain text
  const message = e.data.json();

  // if using the Firebase Admin SDK the data is in message.data, but for easier tests/simulations it the whole message
  const data = message.data || message;

  switch (data.type) {
    case MESSAGE_TYPE.GEO:
      sendMessage(data.type, {
        msg: "What's my GEO",
      });
      break;
  }

  // PushNotification requires the a normal notification to be shown,
  // otherwise it will show a generic one "This site has been updated in the background"
  // See https://pushpad.xyz/blog/chrome-push-notifications-this-site-has-been-updated-in-the-background
  e.waitUntil(
    self.registration.showNotification("MaPhone", {
      body: "",
      icon: notificationImage,
    }),
  );
});

// Click and open notification
self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    if (event.action === "whatever") self.clients.openWindow("/whatever");
  },
  false,
);

// Client(s) communication --------------------------
// many ways - https://web.dev/articles/two-way-communication-guide

// listen to messages from tabs/clients
self.addEventListener("message", (event) => {
  if (event.data.type === MESSAGE_TYPE.GEO) {
    // Process message from a client
  }
});

function sendMessage(type: string, data: any) {
  self.clients.matchAll({ type: "window" }).then(function (clients) {
    if (clients && clients.length) {
      // Respond to last focused tab
      clients[0].postMessage({ type, data });
    }
  });
}
