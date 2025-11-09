import express from "express";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP for iframe testing
  })
);

// Allow embedding in iframes from anywhere (for testing)
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader(
    "Permissions-Policy",
    "microphone=(self), autoplay=(self)"
  );
  next();
});

// Health check
app.get("/healthz", (req, res) => res.send("ok"));

// Serve static files
app.use(express.static("public"));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
