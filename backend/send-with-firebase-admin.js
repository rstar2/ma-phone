const admin = require("firebase-admin");

const serviceAccount = require("./ma-phone-81020-firebase-adminsdk-35pfe-091a30d27a.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const tokens = [
    // ... put tokens here
  ];

app.messaging().sendEach(
  tokens.map((token) => ({
    token,
    data: {
      type: "GEO",
    },
  }))
);
