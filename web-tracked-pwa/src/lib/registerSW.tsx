import { registerSW } from "virtual:pwa-register";
// its type-definitions are added in vite-env.d.ts

import configPush from "./pushNotifications";
import { config as configGEO } from "./geolocation";

registerSW({
  async onRegisteredSW(_swScriptUrl, swReg) {
    console.log("onRegisteredSW");

    // try to configure the PushNotifications
    await configPush(swReg);

    await configGEO();
  },
});
