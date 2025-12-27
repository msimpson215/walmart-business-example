// server.js  (Node/Render-safe, ESM)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Walmart AI Grocery Assistant (VoxTalk demo)", ts: Date.now() });
});

// Static
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Running on :${PORT}`);
});
