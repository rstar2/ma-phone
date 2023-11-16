const admin = require("firebase-admin");

const serviceAccount = require("./ma-phone-81020-firebase-adminsdk-35pfe-091a30d27a.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// get tokens form this file
const tokens = require("./firebase-message-tokens");

(async () => {
  const result = await app.messaging().sendEach(
    tokens.map((token) => ({
      token,
      data: {
        type: "GEO",
      },
    }))
  );
  console.log("Result", result);
})();
