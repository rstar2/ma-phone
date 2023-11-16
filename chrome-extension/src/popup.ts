import "./popup.css";
import { storageDeviceName } from "./lib/storage";
import { MESSAGE_TYPE } from "./lib/utils";

function init() {
  const deviceNameInput = document.getElementById("deviceNameInput") as HTMLInputElement;
  const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;

  let oldDeviceName: string | undefined;
  // disallow editing/registering until current s get
  deviceNameInput.disabled = true;
  registerBtn.disabled = true;

  // on click send a message to serviceWorker to register/unregister this device
  registerBtn.addEventListener("click", () => {
    const deviceName = deviceNameInput.value;
    // no need to do anything
    if (deviceName === oldDeviceName) return;
    
    sendMessageServiceWorker(MESSAGE_TYPE.REGISTER, {
      deviceName,
      oldDeviceName,
    }, () => {
        // close itself
        window.close();
    });
  });

  // get current device name and allow editing/registering
  storageDeviceName.get((deviceName?: string) => {
    deviceNameInput.disabled = false;
    registerBtn.disabled = false;
    deviceNameInput.value = deviceName || "";
    // store as current/old
    oldDeviceName = deviceName;
  });
}

// Communicate with serviceWorker by sending a message
function sendMessageServiceWorker(type: string, data?: Record<string, any>, cb?: () => void) {
  console.log(`Send message ${type} to serviceWorker.`);

  chrome.runtime.sendMessage(
    {
      type,
      data,
    },
    (response) => {
      // lister for response
      if (response) console.log(`Response from serviceWorker: ${JSON.stringify(response)}.`);
      cb?.();
    },
  );
}

// Communicate with content script of active tab by sending a message
function sendMessageActiveTab(type: string, data?: Record<string, any>) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    // send message to content scripts
    chrome.tabs.sendMessage(
      tab.id!,
      {
        type,
        data,
      },
      (response) => {
        // lister for response
        console.log(`Response from active tab contentScript: ${JSON.stringify(response)}.`);
      },
    );
  });
}

document.addEventListener("DOMContentLoaded", init);

// demo
sendMessageServiceWorker("GREETINGS", { message: "Hello from Popup." });
