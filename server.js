import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// -------------------------
// ESM-safe __dirname
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// App setup
// -------------------------
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// -------------------------
// Serve static frontend
// -------------------------
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// Health check
// -------------------------
app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
});

// -------------------------
// SESSION endpoint
// Creates ephemeral client_secret for Realtime voice
// -------------------------
app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY in environment"
      });
    }

    const model = process.env.REALTIME_MODEL || "gpt-4o-realtime-preview";
    const voice = process.env.REALTIME_VOICE || "alloy";

    const r = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expires_after: { seconds: 600 },
          session: { model, voice }
        })
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: "Failed to create client secret",
        details: data
      });
    }

    return res.json({
      client_secret: data.client_secret,
      model,
      voice
    });

  } catch (err) {
    return res.status(500).json({
      error: "Session error",
      message: err?.message || String(err)
    });
  }
});

// -------------------------
// OPTIONAL: text chat endpoint
// (safe fallback if /chat is called)
// -------------------------
app.post("/chat", async (req, res) => {
  res.json({
    reply: "Text chat is disabled in this demo. Use voice."
  });
});

// -------------------------
// SPA fallback
// -------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------------
// Start server (Render requirement)
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
