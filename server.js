import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const FIREWORKS_KEY = process.env.FIREWORKS_KEY;

app.post("/generate", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/image/generate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FIREWORKS_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "flux-schnell",
          prompt: userPrompt,
          width: 1024,
          height: 1024,
          steps: 30,
          output_format: "jpeg"
        })
      }
    );

    const data = await response.json();
    return res.json({ image_url: data.images[0].url });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Flux backend running on port 3000");
});
