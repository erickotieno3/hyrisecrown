import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import security from "./security";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: Uncomment to enable auto-deployment scheduler
// This will create deployments on the schedule defined in scripts/schedule-deploy.js
// Note: You need to set REPLIT_API_TOKEN and REPLIT_SLUG in your Replit secrets
// try {
//   const { scheduleDeployments } = require('../scripts/schedule-deploy');
//   scheduleDeployments();
//   console.log('Auto-deployment scheduler started');
// } catch (error) {
//   console.warn('Auto-deployment scheduler could not be started:', error);
// }

// Ensure logs directory exists
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();

// Enable CORS for all routes to support custom domain
app.use((req, res, next) => {
  // Allow your custom domain and Replit's domain
  const allowedOrigins = [
    'https://hyrisecrown.com', 
    'https://www.hyrisecrown.com',
    'https://tesco-compare--hyrisecrown.repl.co'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // For local development and other sources
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
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

// Apply CSRF and SQL injection protection
app.use(security.csrfProtectionMiddleware);
app.use(security.sqlInjectionProtectionMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Add security error handler
  app.use(security.securityErrorHandler);
  
  // General error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with IP for security tracking
    const ip = security.getIpAddress(req);
    const errorDetails = {
      ip,
      path: req.path,
      method: req.method,
      status,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };
    
    console.error('Server error:', errorDetails);
    
    // Log to security log if it seems like a security-related error
    if (status === 401 || status === 403 || status === 429) {
      fs.appendFile(
        path.join(logsDir, 'security.log'),
        `${new Date().toISOString()} | IP: ${ip} | Error: ${message} | Path: ${req.path}\n`,
        (error) => {
          if (error) console.error('Failed to write to security log:', error);
        }
      );
    }

    // Send response but don't include sensitive error details in production
    res.status(status).json({ 
      message: process.env.NODE_ENV === 'production' && status >= 500
        ? 'Internal Server Error' 
        : message,
      code: err.code || 'SERVER_ERROR'
    });
  });

  // Register API routes first to ensure API endpoints take precedence
  console.log("API routes registered");

  // Then set up Vite middleware or static file serving for the client app
  // This ensures that non-API routes get handled by the React app
  if (app.get("env") === "development") {
    console.log("Setting up Vite middleware in development mode");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving in production mode");
    serveStatic(app);
  }

  // Try different ports if the default port is already in use
  const startPort = 5000;
  const tryPort = (port: number) => {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
        tryPort(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };
  
  tryPort(startPort);
})();
