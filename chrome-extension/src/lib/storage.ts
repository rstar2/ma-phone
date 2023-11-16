// To get storage access, we have to mention it in `permissions` property of manifest.json file
// More information on Permissions can we found at
// https://developer.chrome.com/extensions/declare_permissions

// We will make use of Storage API to get and store values
// More information on Storage API can we found at
// https://developer.chrome.com/extensions/storage

// name of the storage key for the current registered device name
const STORAGE_KEY_DEVICE_NAME = "deviceName";

const storageDeviceName = {
  get: (cb: (deviceName?: string) => void) => {
    chrome.storage.local.get([STORAGE_KEY_DEVICE_NAME], (result) => {
      const deviceName = result[STORAGE_KEY_DEVICE_NAME] as string | undefined;
      console.log(`Get from storage "${STORAGE_KEY_DEVICE_NAME}" to be ${deviceName}`);
      cb(deviceName);
    });
  },
  set: (deviceName: string, cb?: () => void) => {
    chrome.storage.local.set(
      {
        [STORAGE_KEY_DEVICE_NAME]: deviceName,
      },
      () => {
        console.log(`Set in storage "${STORAGE_KEY_DEVICE_NAME}" to be ${deviceName}`);
        cb?.();
      },
    );
  },
};

export { storageDeviceName };
