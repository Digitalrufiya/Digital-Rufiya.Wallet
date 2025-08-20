const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.sharePage = functions.https.onRequest(async (req, res) => {
  // Extract postId from URL: /share/POSTID
  const postId = req.path.split("/").pop();

  try {
    const doc = await db.collection("marketingPosts").doc(postId).get();

    if (!doc.exists) {
      res.status(404).send("Post not found");
      return;
    }

    const data = doc.data();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`;

    // Generate HTML with OG and Twitter tags
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${data.title}</title>

        <!-- Open Graph -->
        <meta property="og:title" content="${data.title}" />
        <meta property="og:description" content="${data.description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="https://${req.hostname}/share/${postId}" />
        <meta property="og:type" content="article" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${data.title}" />
        <meta name="twitter:description" content="${data.description}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <!-- Redirect to marketing.html -->
        <meta http-equiv="refresh" content="0; url=/marketing.html?post=${postId}" />
      </head>
      <body>
        Redirecting to <a href="/marketing.html?post=${postId}">${data.title}</a>...
      </body>
      </html>
    `;

    res.status(200).send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
