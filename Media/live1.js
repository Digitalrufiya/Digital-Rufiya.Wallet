import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/live", async (req, res) => {
  try {
    const response = await fetch("https://livepeer.studio/api/stream", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.86690d89-ff4d-4e5e-abeb-68c2d7582b35}`, // set in env
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body || { name: "My Test Stream" })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
