// server.js (ROOT of repo)
// Minimal Express server for Render + /session + /chat
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve /public as the site
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/healthz", (req, res) => res.status(200).send("ok"));

// ---- SESSION for Realtime WebRTC ----
// This endpoint is called by your browser code: fetch("/session",{method:"POST"})
app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in Render Environment.",
      });
    }

    const model = process.env.REALTIME_MODEL || "gpt-4o-realtime-preview";
    const voice = process.env.REALTIME_VOICE || "alloy";

    // For browser WebRTC, you should NOT expose your long-lived API key.
    // The recommended approach is to create an ephemeral key/session on the server.
    // We'll request an ephemeral client secret from OpenAI.
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(r.status).json({
        error: "Failed to create realtime session",
        details: data,
      });
    }

    // Browser expects: { client_secret: { value: "..." }, model, voice }
    return res.json({
      client_secret: data.client_secret,
      model,
      voice,
    });
  } catch (err) {
    return res.status(500).json({ error: "Session error", details: String(err) });
  }
});

// ---- Simple /chat endpoint ----
// Your UI calls fetch("/chat",{prompt})
app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in Render Environment." });
    }

    const prompt = (req.body?.prompt || "").toString();
    if (!prompt.trim()) return res.json({ reply: "" });

    // Keep it simple + cheap: use Responses API.
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: "Chat failed", details: data });
    }

    // Pull text safely
    const text =
      data.output_text ||
      (data.output?.[0]?.content?.[0]?.text ?? "") ||
      "";

    return res.json({ reply: text });
  } catch (err) {
    return res.status(500).json({ error: "Chat error", details: String(err) });
  }
});

// SPA fallback to public/index.html (optional but helpful)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
