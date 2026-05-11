/**
 * Vendor Authentication and Management Routes
 * 
 * This file contains routes for vendor authentication and dashboard management:
 * - Login
 * - Registration
 * - Product management
 * - Sales analytics
 */

import { Router, Request, Response } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { WebSocketServer } from 'ws';

// Create a router
const vendorRouter = Router();

// WebSocket server reference for real-time updates
let wss: WebSocketServer;

export function setWebSocketServer(websocketServer: WebSocketServer) {
  wss = websocketServer;
}

// For development purposes, hardcoded vendor accounts
// In production, these would be stored in the database
const VENDOR_ACCOUNTS = [
  {
    id: 1,
    email: 'tesco@vendor.com',
    password: 'B7gP!x@9mR*Tsc0#V3nd0r$2025&zQ4w',
    name: 'Tesco Vendor',
    storeName: 'Tesco',
    products: 156,
    sales: 230,
    revenue: 3200,
    rating: 4.5
  },
  {
    id: 2,
    email: 'walmart@vendor.com',
    password: 'K3jM$r8vT*W4lm4rt!V3nd0r@2025#L6sY',
    name: 'Walmart Vendor',
    storeName: 'Walmart',
    products: 203,
    sales: 178,
    revenue: 2780,
    rating: 4.2
  },
  {
    id: 3,
    email: 'amazon@vendor.com',
    password: 'F5dN@e7cX*Amzn#V3nd0r$2025&H2pZ',
    name: 'Amazon Vendor',
    storeName: 'Amazon',
    products: 415,
    sales: 623,
    revenue: 12460,
    rating: 4.8
  }
];

// Track active vendor sessions
const vendorSessions: Map<string, {
  vendorId: number;
  email: string;
  lastActivity: Date;
}> = new Map();

// Helper function for password hashing
const scryptAsync = promisify(scrypt);

/**
 * Vendor Login Route
 */
vendorRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  // Find vendor account - with more logging for debugging
  console.log(`Attempting login for: ${email}`);
  const vendor = VENDOR_ACCOUNTS.find(v => v.email === email);
  
  if (!vendor) {
    console.log(`Vendor not found for email: ${email}`);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  }
  
  // Compare passwords directly
  console.log(`Checking password match for: ${email}`);
  if (vendor.password !== password) {
    console.log(`Password mismatch for: ${email}`);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  }
  
  console.log(`Login successful for: ${email}`);

  // Create a session
  const sessionId = generateSessionId();
  vendorSessions.set(sessionId, {
    vendorId: vendor.id,
    email: vendor.email,
    lastActivity: new Date()
  });

  // Set session cookie
  res.cookie('vendorSessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // Send vendor profile (excluding password)
  const { password: _, ...vendorProfile } = vendor;
  
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    vendor: vendorProfile
  });
});

/**
 * Check Vendor Authentication Status
 */
vendorRouter.get('/status', (req: Request, res: Response) => {
  const sessionId = req.cookies.vendorSessionId;
  
  if (!sessionId || !vendorSessions.has(sessionId)) {
    return res.status(401).json({ authenticated: false });
  }

  const session = vendorSessions.get(sessionId)!;
  
  // Update last activity
  session.lastActivity = new Date();
  vendorSessions.set(sessionId, session);

  // Find vendor data
  const vendor = VENDOR_ACCOUNTS.find(v => v.id === session.vendorId);
  
  if (!vendor) {
    return res.status(401).json({ authenticated: false });
  }

  // Send vendor profile (excluding password)
  const { password: _, ...vendorProfile } = vendor;

  return res.status(200).json({ 
    authenticated: true, 
    vendor: vendorProfile
  });
});

/**
 * Vendor Logout
 */
vendorRouter.post('/logout', (req: Request, res: Response) => {
  const sessionId = req.cookies.vendorSessionId;
  
  if (sessionId) {
    // Remove session
    vendorSessions.delete(sessionId);
    
    // Clear cookie
    res.clearCookie('vendorSessionId');
  }
  
  return res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

/**
 * Get Vendor Products
 */
vendorRouter.get('/products', (req: Request, res: Response) => {
  const sessionId = req.cookies.vendorSessionId;
  
  if (!sessionId || !vendorSessions.has(sessionId)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  const session = vendorSessions.get(sessionId)!;
  const vendor = VENDOR_ACCOUNTS.find(v => v.id === session.vendorId);
  
  if (!vendor) {
    return res.status(401).json({ 
      success: false, 
      message: 'Vendor not found' 
    });
  }

  // Mock product data
  const products = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    description: 'Product description goes here. This is a sample product for demonstration purposes.',
    price: parseFloat((Math.random() * 100 + 5).toFixed(2)),
    category: ['Electronics', 'Home & Kitchen', 'Grocery', 'Fashion'][Math.floor(Math.random() * 4)],
    stock: Math.floor(Math.random() * 100),
    created: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  }));

  return res.status(200).json({
    success: true,
    products
  });
});

/**
 * Helper to generate a random session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Middleware to clean up expired sessions periodically
setInterval(() => {
  const now = new Date();
  vendorSessions.forEach((session, sessionId) => {
    // Remove sessions inactive for more than 24 hours
    const inactiveTime = now.getTime() - session.lastActivity.getTime();
    if (inactiveTime > 24 * 60 * 60 * 1000) {
      vendorSessions.delete(sessionId);
    }
  });
}, 60 * 60 * 1000); // Run every hour

export default vendorRouter;