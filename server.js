import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// DEBUG — log raw body
app.use(express.text());
app.use((req, res, next) => {
  console.log("RAW BODY:", req.body);
  next();
});

// Then parse JSON correctly
app.use(express.json());
app.use(cors());

const FIREWORKS_KEY = process.env.FIREWORKS_KEY;

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/generate", async (req, res) => {
  try {
    console.log("PARSED BODY:", req.body);

    if (!req.body || !req.body.prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const prompt = req.body.prompt;

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
          prompt,
          width: 1024,
          height: 1024,
          steps: 30,
          output_format: "jpeg"
        }),
      }
    );

    const data = await response.json();
    console.log("FIREWORKS RESPONSE:", data);

    if (!data?.images?.[0]?.url) {
      return res.status(500).json({ error: "Invalid Fireworks response", data });
    }

    res.json({ image_url: data.images[0].url });
  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend listening on port", PORT));
