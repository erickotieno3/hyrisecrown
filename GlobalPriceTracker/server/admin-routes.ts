/**
 * Admin Authentication Routes
 * 
 * This file contains routes for admin authentication, including:
 * - Login
 * - Two-Factor Authentication
 * - Session management
 */

import { Router, Request, Response } from 'express';
import { sendVerificationCode, verifyCode } from './email-service';
import { storage } from './storage';
import { manuallyTriggerTask } from './auto-pilot';
import { WebSocketServer } from 'ws';

// Create a router
const adminRouter = Router();

// WebSocket server reference for real-time updates
let wss: WebSocketServer;

export function setWebSocketServer(websocketServer: WebSocketServer) {
  wss = websocketServer;
}

// Hardcoded admin credentials (in production, use a database)
const ADMIN_CREDENTIALS = {
  email: 'admin@tesco-compare.com',
  password: 'ZmQ5*T3sc0&HyR!$3^Cr0wn@2025#Admin',
  name: 'Admin User'
};

// Store sessions (in memory for development, use Redis/database in production)
const adminSessions: Map<string, {
  email: string;
  authenticated: boolean;
  lastActivity: Date;
}> = new Map();

/**
 * Admin Login Route
 * First factor authentication (username/password)
 */
adminRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Check if credentials match (in production, use bcrypt.compare)
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  try {
    // Generate and send verification code via email
    await sendVerificationCode(email, ADMIN_CREDENTIALS.name);

    // Create a session
    const sessionId = generateSessionId();
    adminSessions.set(sessionId, {
      email,
      authenticated: false, // Not fully authenticated until 2FA is complete
      lastActivity: new Date()
    });

    // Set session cookie
    res.cookie('adminSessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    return res.status(200).json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

/**
 * Send 2FA Verification Code
 */
adminRouter.post('/send-verification', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (email !== ADMIN_CREDENTIALS.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await sendVerificationCode(email, ADMIN_CREDENTIALS.name);
    return res.status(200).json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Failed to send verification code:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

/**
 * Verify 2FA Code
 */
adminRouter.post('/verify-2fa', (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  if (email !== ADMIN_CREDENTIALS.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Verify the code
  const isValid = verifyCode(email, code);

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid or expired verification code' });
  }

  // Update session to fully authenticated
  const sessionId = req.cookies.adminSessionId;
  if (sessionId && adminSessions.has(sessionId)) {
    const session = adminSessions.get(sessionId)!;
    session.authenticated = true;
    session.lastActivity = new Date();
    adminSessions.set(sessionId, session);
  }

  return res.status(200).json({ success: true, message: 'Authentication successful' });
});

/**
 * Check Authentication Status
 */
adminRouter.get('/check-auth', (req: Request, res: Response) => {
  const sessionId = req.cookies.adminSessionId;
  
  if (!sessionId || !adminSessions.has(sessionId)) {
    return res.status(401).json({ authenticated: false });
  }

  const session = adminSessions.get(sessionId)!;
  
  // Check if session is still valid
  if (!session.authenticated) {
    return res.status(401).json({ authenticated: false });
  }

  // Update last activity
  session.lastActivity = new Date();
  adminSessions.set(sessionId, session);

  return res.status(200).json({ 
    authenticated: true, 
    email: session.email 
  });
});

/**
 * Admin Logout
 */
adminRouter.post('/logout', (req: Request, res: Response) => {
  const sessionId = req.cookies.adminSessionId;
  
  if (sessionId) {
    // Remove session
    adminSessions.delete(sessionId);
    
    // Clear cookie
    res.clearCookie('adminSessionId');
  }
  
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
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
  adminSessions.forEach((session, sessionId) => {
    // Remove sessions inactive for more than 30 minutes
    const inactiveTime = now.getTime() - session.lastActivity.getTime();
    if (inactiveTime > 30 * 60 * 1000) {
      adminSessions.delete(sessionId);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * Auto-Pilot Management Routes
 */

// Get all auto-pilot configs
adminRouter.get('/auto-pilot/tasks', async (req: Request, res: Response) => {
  try {
    // Simple authentication check
    if (!req.cookies.adminSessionId || !adminSessions.has(req.cookies.adminSessionId)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const configs = await storage.getAutoPilotConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching auto-pilot tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch auto-pilot tasks',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Run a specific auto-pilot task
adminRouter.post('/auto-pilot/tasks/:id/run', async (req: Request, res: Response) => {
  try {
    // Simple authentication check
    if (!req.cookies.adminSessionId || !adminSessions.has(req.cookies.adminSessionId)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const taskId = parseInt(req.params.id);
    const config = await storage.getAutoPilotConfig(taskId);
    
    if (!config) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (!wss) {
      return res.status(500).json({ error: 'WebSocket server not initialized' });
    }
    
    // Trigger the task
    await manuallyTriggerTask(config.feature, wss);
    
    res.json({
      success: true,
      message: `Task ${config.feature} triggered successfully`
    });
  } catch (error) {
    console.error('Error running auto-pilot task:', error);
    res.status(500).json({ 
      error: 'Failed to run auto-pilot task',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Toggle a task's enabled status
adminRouter.post('/auto-pilot/tasks/:id/toggle', async (req: Request, res: Response) => {
  try {
    // Simple authentication check
    if (!req.cookies.adminSessionId || !adminSessions.has(req.cookies.adminSessionId)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const taskId = parseInt(req.params.id);
    const { isEnabled } = req.body;
    
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ error: 'isEnabled parameter must be a boolean' });
    }
    
    const config = await storage.getAutoPilotConfig(taskId);
    
    if (!config) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update the config
    const updatedConfig = await storage.updateAutoPilotConfig(taskId, { isEnabled });
    
    res.json({
      success: true,
      config: updatedConfig,
      message: `Task ${config.feature} ${isEnabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling auto-pilot task:', error);
    res.status(500).json({ 
      error: 'Failed to toggle auto-pilot task',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generate a new blog post
adminRouter.post('/auto-blog/generate', async (req: Request, res: Response) => {
  try {
    // Simple authentication check
    if (!req.cookies.adminSessionId || !adminSessions.has(req.cookies.adminSessionId)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!wss) {
      return res.status(500).json({ error: 'WebSocket server not initialized' });
    }
    
    // Trigger the auto-blog task
    await manuallyTriggerTask('auto-blog-weekly', wss);
    
    res.json({
      success: true,
      message: 'Blog post generation started'
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    res.status(500).json({ 
      error: 'Failed to generate blog post',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Trigger a price update
adminRouter.post('/auto-pilot/price-update/run', async (req: Request, res: Response) => {
  try {
    // Simple authentication check
    if (!req.cookies.adminSessionId || !adminSessions.has(req.cookies.adminSessionId)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!wss) {
      return res.status(500).json({ error: 'WebSocket server not initialized' });
    }
    
    // Trigger the price update task
    await manuallyTriggerTask('price-update', wss);
    
    res.json({
      success: true,
      message: 'Price update started'
    });
  } catch (error) {
    console.error('Error running price update:', error);
    res.status(500).json({ 
      error: 'Failed to run price update',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default adminRouter;