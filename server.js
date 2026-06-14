const http = require("http");
const fs = require("fs");
const path = require("path");
const contactHandler = require("./api/contact");

const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
}

function serveStatic(req, res) {
  let filePath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (filePath === "/") filePath = "/index.html";

  const absolutePath = path.join(ROOT, filePath);
  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absolutePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

loadEnv();

function createServer() {
  return http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;

    if (pathname === "/api/contact") {
      contactHandler(req, res);
      return;
    }

    serveStatic(req, res);
  });
}

function startServer(port, maxAttempts = 10) {
  const server = createServer();

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && maxAttempts > 0) {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
      return;
    }

    console.error(err.message);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Site running at http://localhost:${port}`);
    console.log(`Contact form API available at http://localhost:${port}/api/contact`);
  });
}

const startPort = Number(process.env.PORT) || 3000;
startServer(startPort);
