// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.text({ type: "*/*" }));

app.use((req, res, next) => {
  try {
    req.body = JSON.parse(req.body || "{}");
  } catch {
    req.body = {};
  }
  next();
});

const FIREWORKS_KEY = process.env.FIREWORKS_KEY;

app.post("/generate", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    if (!FIREWORKS_KEY) {
      return res.status(500).json({ error: "FIREWORKS_KEY not set" });
    }

    const response = await fetch("https://api.fireworks.ai/inference/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIREWORKS_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "flux-pro-1.1",
        prompt: userPrompt,
        width: 1024,
        height: 1024,
        steps: 30,
        output_format: "jpeg",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Fireworks error:", response.status, err);
      return res.status(502).json({ error: "Fireworks API error", details: err });
    }

    const data = await response.json();

    if (!data?.images?.[0]?.url) {
      return res.status(500).json({ error: "No image URL returned", data });
    }

    res.json({ image_url: data.images[0].url });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Flux backend running on port ${PORT}`);
});
