import { registerSW } from "virtual:pwa-register";
// its type-definitions are added in vite-env.d.ts

import configPush from "./configurePushNotifications";
import configGeo, { getCurrentPosition } from "./geolocation";

registerSW({
  async onRegisteredSW(_swScriptUrl, swReg) {
    console.log("onRegisteredSW");

    // try to configure the PushNotifications
    await configPush(swReg);

    await configGeo();
  },
});

// //send message
// navigator.serviceWorker.controller.postMessage({
//   type: "MSG_ID",
// });

//listen to messages
navigator.serviceWorker.onmessage = async (event) => {
  if (event.data && event.data.type === "geo") {
    // process message from service-worker
    const pos = await getCurrentPosition();
    console.log(pos);
  }
};
