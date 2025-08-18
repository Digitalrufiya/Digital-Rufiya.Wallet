const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.getLivepeerToken = functions.https.onCall(async (data, context) => {
  try {
    const streamId = data.streamId; // pass from frontend
    const API_KEY = functions.config().livepeer.key; // set via firebase functions:config:set

    const response = await fetch(`https://livepeer.studio/api/stream/${streamId}/webrtc-session`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const result = await response.json();
    return { token: result.client_secret.value };
  } catch (err) {
    console.error("Error generating token:", err);
    return { error: "Failed to generate token" };
  }
});
