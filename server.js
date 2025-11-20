import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.text({ type: "*/*" }));

app.use((req, res, next) => {
try { req.body = JSON.parse(req.body || "{}"); }
catch { req.body = {}; }
next();
});

const FIREWORKS_KEY = process.env.FIREWORKS_KEY;

app.post("/generate", async (req, res) => {
try {
const userPrompt = req.body.prompt;
if (!userPrompt) return res.status(400).json({ error: "Missing prompt" });

const response = await fetch("https://api.fireworks.ai/inference/v1/images/generations", {
method: "POST",
headers: {
Authorization: `Bearer ${FIREWORKS_KEY}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
model: "flux-pro-1.1",
prompt: userPrompt,
width: 1024,
height: 1024,
steps: 30,
output_format: "jpeg"
})
});

const data = await response.json();
if (!data?.images?.[0]?.url) return res.status(500).json({ error: "Invalid response from Fireworks", data });

return res.json({ image_url: data.images[0].url });
} catch (error) {
return res.status(500).json({ error: error.message });
}
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log(`Flux backend running on port ${PORT}`); });
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

    if (!data?.images?.[0]?.url) {
      return res.status(500).json({
        error: "Invalid response from Fireworks",
        data,
      });
    }

    return res.json({
      image_url: data.images[0].url,
    });

  } catch (error) {
    console.error("🔥 SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🔥 Flux backend running on port ${PORT}`);
});
