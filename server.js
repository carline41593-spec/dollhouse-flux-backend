import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ strict: true })); // STRICT JSON PARSING

const FIREWORKS_KEY = process.env.FIREWORKS_KEY;

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Generate route
app.post("/generate", async (req, res) => {
  try {
    console.log("RAW BODY RECEIVED:", req.body); // DEBUG LINE

    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/images/generations",
      {
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
      }
    );

    const data = await response.json();
    console.log("FIREWORKS RESPONSE:", data);

    if (!data?.images?.[0]?.url) {
      return res.status(500).json({
        error: "Invalid response from Fireworks",
        data,
      });
    }

    res.json({ image_url: data.images[0].url });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Flux backend running on port", PORT);
});
