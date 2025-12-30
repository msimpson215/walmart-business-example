import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "voxtalk-walmart-demo", ts: new Date().toISOString() });
});

// SPA-style fallback (optional but helpful)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
