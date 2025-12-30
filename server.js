import express from "express";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;


// Basic hardening & perf
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));


// Health check for Render
app.get("/api/health", (_req, res) => {
res.json({ ok: true, service: "VoxTalk demo", ts: Date.now() });
});


// Serve static front-end from /public
app.use(express.static(path.join(__dirname, "public"), {
extensions: ["html"],
setHeaders(res, filePath) {
if (filePath.endsWith(".html")) {
res.setHeader("Cache-Control", "no-store");
}
}
}));


// Catch-all → index.html (so deep links work)
app.get("*", (_req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(PORT, () => {
console.log(`✅ VoxTalk — Walmart AI is running on http://localhost:${PORT}`);
});
