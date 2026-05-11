import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import security from "./security";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// Enable CORS for all routes (needed for Replit deployment)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Apply security middleware
app.use(security.securityHeadersMiddleware);
app.use(security.rateLimitMiddleware);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Special diagnostic routes with high priority
app.get("/health", (req, res) => {
  res.status(200).send({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

app.get("/deploytest", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deployment Test</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: green; }
        .info { color: blue; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Deployment Test Page</h1>
      <p class="success">✓ Server is running!</p>
      <p class="info">Server time: ${new Date().toISOString()}</p>
      <p class="info">Environment: ${process.env.NODE_ENV || "development"}</p>
      
      <h2>Request Details</h2>
      <pre>${JSON.stringify({
        headers: req.headers,
        ip: req.ip,
        protocol: req.protocol,
        hostname: req.hostname,
        path: req.path,
        method: req.method
      }, null, 2)}</pre>
      
      <h2>Test Links</h2>
      <ul>
        <li><a href="/ping">Simple ping test</a></li>
        <li><a href="/barebones">Barebones HTML test</a></li>
        <li><a href="/api/mobile/status">API status check</a></li>
      </ul>
    </body>
    </html>
  `);
});

// Add security error handler
app.use(security.securityErrorHandler);

// General error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send response but don't include sensitive error details in production
  res.status(status).json({ 
    message: process.env.NODE_ENV === 'production' && status >= 500
      ? 'Internal Server Error' 
      : message,
    code: err.code || 'SERVER_ERROR'
  });
});

(async () => {
  const server = await registerRoutes(app);
  
  // Set up static file serving
  serveStatic(app);

  // ALWAYS serve the app on port 5000 (or the PORT env variable)
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Production server serving on port ${port}`);
  });
})();