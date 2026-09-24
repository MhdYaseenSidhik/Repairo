"use strict";

// Minimal static file server for the Repairo docs image — Node standard
// library only, so the runtime image needs nothing installed from a registry.
// Serves files from its own directory, defaulting "/" to README.md.

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".md": "text/markdown; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  // Only GET/HEAD are meaningful for a static docs site.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end("Method Not Allowed");
  }

  // Decode, strip the query string, and resolve within ROOT — reject any
  // path that escapes the docs directory (directory-traversal guard).
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  } catch {
    res.writeHead(400);
    return res.end("Bad Request");
  }
  if (urlPath === "/" || urlPath === "") urlPath = "/README.md";

  const resolved = path.normalize(path.join(ROOT, urlPath));
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(resolved, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not Found");
    }
    const type = TYPES[path.extname(resolved).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(resolved)
      .on("error", () => {
        // Partial read failure after headers are sent — end the response.
        res.destroy();
      })
      .pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Repairo docs served on http://0.0.0.0:${PORT}`);
});
