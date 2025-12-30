import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Paths (ESM-safe __dirname) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App ---
const app = express();

// Security + basics
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve your static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/healthz", (req, res) => res.status(200).send("ok"));

// ---- IMPORTANT: /session endpoint for your browser client ----
// Gemini's public/index.html does: fetch("/session", { method:"POST" })
//
// This endpoint creates an ephemeral client secret for the Realtime API.
// Docs: /v1/realtime/client_secrets or /v1/realtime/sessions :contentReference[oaicite:1]{index=1}
app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in Render environment variables."
      });
    }

    // You can override these in Render env vars later
    const model = process.env.REALTIME_MODEL || "gpt-4o-realtime-preview";
    const voice = process.env.REALTIME_VOICE || "alloy";

    // Create a client secret (ephemeral token) for browser use
    // Endpoint: POST https://api.openai.com/v1/realtime/client_secrets :contentReference[oaicite:2]{index=2}
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // keep it short-lived; you can adjust later
        expires_after: { seconds: 600 },
        session: {
          // Minimal session config; browser will call /v1/realtime?model=...&voice=...
          // Keeping these values here for your frontend to read back.
          model,
          voice
        }
      })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(r.status).json({
        error: "OpenAI client secret creation failed",
        details: data
      });
    }

    // Your frontend expects: { client_secret, model, voice }
    return res.json({
      client_secret: data.client_secret,
      model,
      voice
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server /session error",
      message: err?.message || String(err)
    });
  }
});

// SPA fallback (optional). Keeps / working even if you add routes later.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
