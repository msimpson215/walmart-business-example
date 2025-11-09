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

// ✅ Headers to allow embedding and microphone access safely
app.use((req, res, next) => {
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

// health check for Render
app.get("/healthz", (_, res) => res.status(200).send("ok"));

// serve front-end files
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// fallback route → index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ VoxTalk running on port " + port));
