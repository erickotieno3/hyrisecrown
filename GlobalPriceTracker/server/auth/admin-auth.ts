import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";

// Admin credentials - in production, store these in environment variables or a database
const ADMIN_EMAIL = "admin@tesco-compare.com";
const ADMIN_PASSWORD_HASH = "76d80224611fc919a5d54f0ff9fba446"; // Hashed version of "ZmQ5*T3sc0&HyR!$3^Cr0wn@2025#Admin"

// Admin session tokens
const adminSessions: Record<string, { email: string, expires: Date }> = {};

// Hash the password using MD5 (for simplicity - use a stronger hash in production)
function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Generate a session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Authenticate admin credentials
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if the request has a valid session token
  const sessionToken = req.headers['x-admin-token'] as string;
  
  if (sessionToken && adminSessions[sessionToken]) {
    // Check if the session is still valid
    if (adminSessions[sessionToken].expires > new Date()) {
      // Session is valid
      return next();
    } else {
      // Session has expired, remove it
      delete adminSessions[sessionToken];
    }
  }
  
  // No valid session token, return unauthorized
  return res.status(401).json({ error: "Unauthorized - Admin privileges required" });
}

// Login endpoint for admin
export function adminLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  // Check credentials
  if (email === ADMIN_EMAIL && hashPassword(password) === ADMIN_PASSWORD_HASH) {
    // Create a session token
    const token = generateSessionToken();
    
    // Set expiration to 24 hours from now
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    
    // Store the session
    adminSessions[token] = {
      email,
      expires: expiration
    };
    
    // Return the token
    return res.json({
      token,
      expires: expiration,
      email
    });
  }
  
  // Invalid credentials
  return res.status(401).json({ error: "Invalid credentials" });
}

// Logout endpoint for admin
export function adminLogout(req: Request, res: Response) {
  const sessionToken = req.headers['x-admin-token'] as string;
  
  if (sessionToken && adminSessions[sessionToken]) {
    // Remove the session
    delete adminSessions[sessionToken];
    return res.json({ message: "Logged out successfully" });
  }
  
  return res.status(400).json({ error: "No valid session to logout from" });
}