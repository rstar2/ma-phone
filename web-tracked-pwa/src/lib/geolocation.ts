const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
export type GEO = {
  latitude: number;
  longitude: number;
  accuracy: number;
  //   timestamp: EpochTimeStamp;
};

const noop = () => undefined;

export async function config() {
  navigator.geolocation.getCurrentPosition(noop, noop);
}

export async function getCurrentPosition(): Promise<GEO> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      function success({ coords /* , timestamp */ }) {
        const { latitude, longitude, accuracy } = coords;
        // console.log("Your current position is:");
        // console.log(`Latitude : ${latitude}`);
        // console.log(`Longitude: ${longitude}`);
        // console.log(`More or less ${accuracy} meters.`);

        resolve({
          latitude,
          longitude,
          accuracy,
          //   timestamp,
        });
      },
      function error(err) {
        reject(new Error(`ERROR(${err.code}): ${err.message}`));
      },
      options,
    );
  });
}
