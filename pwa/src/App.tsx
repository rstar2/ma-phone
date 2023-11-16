import { useState, useEffect } from "react";

import "./App.css";
import logo from "/logo.svg";
import firebase from "./lib/firebase";
import { MESSAGE_TYPE } from "./lib/utils";
import { getCurrentPosition as getGEO } from "./lib/geolocation";
import { getFCMToken } from "./lib/pushNotifications";

const LOCALE_STORAGE_KEY_DEVICE_NAME = "deviceName";
function App() {
  const [isDisabled, setDisabled] = useState(true);
  const [deviceName, setDeviceName] = useState("");
  const [isRegistered, setRegistered] = useState(false);

  useEffect(() => {
    const oldDeviceName = localStorage.getItem(LOCALE_STORAGE_KEY_DEVICE_NAME);
    setDeviceName(oldDeviceName || "");
    setDisabled(false);
    setRegistered(!!oldDeviceName);
  }, []);

  const handleRegister = async () => {
    const oldDeviceName = localStorage.getItem(LOCALE_STORAGE_KEY_DEVICE_NAME);
    if (oldDeviceName) {
      await firebase.httpsCallable("removeDevice")({
        name: oldDeviceName,
      });
      setRegistered(false);
      localStorage.removeItem(LOCALE_STORAGE_KEY_DEVICE_NAME);
    }

    if (deviceName) {
      await firebase.httpsCallable("addDevice")({
        name: deviceName,
        userAgent: navigator.userAgent,
        fcm: await getFCMToken(),
      });
      setRegistered(true);
      localStorage.setItem(LOCALE_STORAGE_KEY_DEVICE_NAME, deviceName);
    }
  };
  return (
    <div>
      <div>
        <img src={logo} alt="logo" />
      </div>
      <h5>Keep me open please...</h5>
      <hr />

      <label htmlFor="deviceName" style={{ margin: "0 10px" }}>
        Device Name:
      </label>
      <input id="deviceName" disabled={isDisabled} value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
      <button onClick={handleRegister} disabled={isDisabled} style={{ margin: "0 10px" }}>
        Register
      </button>
      {isRegistered && <span title="Registered">✔️</span>}
    </div>
  );
}

// //send message to serviceWorker
// navigator.serviceWorker.controller.postMessage({
//   type: "MSG_ID",
// });

// listen to messages from serviceWorker
navigator.serviceWorker.onmessage = async (event) => {
  if (event.data.type === MESSAGE_TYPE.GEO) {
    // process message from service-worker
    const deviceName = localStorage.getItem(LOCALE_STORAGE_KEY_DEVICE_NAME);
    if (!deviceName) return;

    const geo = await getGEO();
    firebase.httpsCallable("reportDeviceGEO")({
      name: deviceName,
      geo,
    });
  }
};

export default App;
