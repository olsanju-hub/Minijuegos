"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8080);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

function listLanIpv4() {
  const result = [];
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    if (!entries) {
      continue;
    }
    for (const item of entries) {
      if (item.family === "IPv4" && !item.internal) {
        result.push(item.address);
      }
    }
  }
  return result;
}

function isDocumentNavigation(req) {
  const acceptHeader = String(req.headers.accept || "");
  const fetchDest = String(req.headers["sec-fetch-dest"] || "");
  return fetchDest === "document" || acceptHeader.includes("text/html");
}

function safeResolveFile(requestPath) {
  const normalized = path.normalize(path.join(ROOT_DIR, requestPath));
  if (!normalized.startsWith(ROOT_DIR)) {
    return null;
  }
  return normalized;
}

function serveFile(req, res, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Error interno");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  });
}

function requestHandler(req, res) {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Metodo no permitido");
    return;
  }

  let requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;

  // Si se navega a un asset como documento, forzamos SPA para evitar mostrar crudo.
  if (isDocumentNavigation(req) && /\.(?:js|css|mjs|map|json)$/i.test(requestPath)) {
    requestPath = "/index.html";
  }

  let filePath = safeResolveFile(requestPath);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Acceso denegado");
    return;
  }

  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(ROOT_DIR, "index.html");
    }
  } catch (error) {
    filePath = path.join(ROOT_DIR, "index.html");
  }

  serveFile(req, res, filePath);
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`Minijuegos disponible en http://localhost:${PORT}`);
  for (const ip of listLanIpv4()) {
    console.log(`Red local: http://${ip}:${PORT}`);
  }
});
