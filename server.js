import express from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());
app.use(cors());

// ✅ Allow embedding + mic from host shells
app.use((req, res, next) => {
  // IMPORTANT: don't set X-Frame-Options: DENY/SAMEORIGIN
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https:; frame-ancestors 'self' *; connect-src 'self' https: wss:; media-src 'self' https: blob:; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;"
  );
  res.setHeader(
    "Permissions-Policy",
    'microphone=(self "*"), camera=(), geolocation=()'
  );
  next();
});

// Health check for Render
app.get("/healthz", (_, res) => res.status(200).send("ok"));

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Fallback to /public/index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ VoxTalk running on :" + port));
