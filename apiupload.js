// File: api/upload.js (Vercel Serverless Function)

import formidable from "formidable";
import fs from "fs";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing form" });

    const { name, bio, wallet } = fields;
    const image = files.image;

    if (!image || !name || !bio || !wallet) {
      return res.status(400).json({ error: "All fields are required." });
    }

    try {
      // Upload image to Pinata
      const imageData = new FormData();
      imageData.append("file", fs.createReadStream(image.filepath));

      const imageRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", imageData, {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...imageData.getHeaders(),
        },
      });

      const imageHash = imageRes.data.IpfsHash;

      // Upload metadata to Pinata
      const metadata = {
        name,
        bio,
        wallet,
        image: `ipfs://${imageHash}`,
      };

      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ cid: metadataRes.data.IpfsHash });
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(500).json({ error: "Upload to Pinata failed." });
    }
  });
}
