import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
    contentSecurityPolicy: false // Allows WebRTC/OpenAI connections
}));
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const model = process.env.REALTIME_MODEL || "gpt-4o-realtime-preview";
    const voice = process.env.REALTIME_VOICE || "alloy";

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        expires_after: { seconds: 600 },
        session: { model, voice }
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "OpenAI error", details: data });

    return res.json({ client_secret: data.client_secret, model, voice });
  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
});

app.post("/chat", async (req, res) => {
  const prompt = req.body?.prompt || "";
  return res.json({ reply: `Demo mode: I heard "${prompt}".` });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});
