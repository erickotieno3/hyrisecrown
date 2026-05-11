/**
 * Security Middleware and Utilities
 * 
 * This file contains security-related middleware and utilities to protect
 * the Tesco Price Comparison platform from unauthorized access and attacks.
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 100,
  // CSRF protection
  CSRF_TOKEN_EXPIRY: 3600000, // 1 hour in milliseconds
  // IP blocking
  MAX_FAILED_ATTEMPTS: 5,
  BLOCK_DURATION: 3600000, // 1 hour in milliseconds
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': process.env.NODE_ENV === 'development' 
      ? "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';" 
      : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.paypal.com https://js.stripe.com https://pagead2.googlesyndication.com https://partner.googleadservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://www.paypal.com ws: wss:; frame-src https://js.stripe.com https://www.paypal.com https://pagead2.googlesyndication.com;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)'
  }
};

// Store for rate limiting and IP blocking
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface BlockedIpEntry {
  failedAttempts: number;
  blockedUntil?: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();
const blockedIpStore: Map<string, BlockedIpEntry> = new Map();
const csrfTokens: Map<string, number> = new Map(); // token -> expiry time

// Audit logging
const logSecurityEvent = (event: string, ip: string, details: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | IP: ${ip} | Event: ${event} | Details: ${JSON.stringify(details)}\n`;
  
  // Ensure the logs directory exists
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to security log file
  fs.appendFile(
    path.join(logsDir, 'security.log'), 
    logEntry, 
    (err) => {
      if (err) {
        console.error('Failed to write security log:', err);
      }
    }
  );
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Security Event: ${event} | IP: ${ip}`);
  }
};

/**
 * IP Address Extraction Middleware
 * 
 * Gets the real IP address even when behind a proxy
 */
export const getIpAddress = (req: Request): string => {
  // Get IP from various headers or fallback to connection remote address
  return (
    req.headers['cf-connecting-ip'] as string ||
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.socket.remoteAddress ||
    '0.0.0.0'
  );
};

/**
 * Rate Limiting Middleware
 * 
 * Limits the number of requests per minute from a single IP address
 */
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = getIpAddress(req);
  const now = Date.now();
  
  // Skip rate limiting for certain paths
  if (req.path.startsWith('/public/') || req.path.startsWith('/assets/')) {
    return next();
  }
  
  // Check if IP is blocked
  const blockedIpEntry = blockedIpStore.get(ip);
  if (blockedIpEntry && blockedIpEntry.blockedUntil && blockedIpEntry.blockedUntil > now) {
    logSecurityEvent('BLOCKED_IP_REQUEST', ip, { path: req.path });
    return res.status(403).json({
      error: 'IP address blocked due to suspicious activity',
      code: 'IP_BLOCKED'
    });
  }
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(ip);
  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + 60000 }; // Reset after 1 minute
  }
  
  // Increment request count
  entry.count++;
  rateLimitStore.set(ip, entry);
  
  // Check if rate limit exceeded
  if (entry.count > SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    // Add to blocked IPs or increment failed attempts
    let blockEntry = blockedIpStore.get(ip) || { failedAttempts: 0 };
    blockEntry.failedAttempts++;
    
    // Block IP if too many failed attempts
    if (blockEntry.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
      blockEntry.blockedUntil = now + SECURITY_CONFIG.BLOCK_DURATION;
      logSecurityEvent('IP_BLOCKED', ip, { 
        failedAttempts: blockEntry.failedAttempts,
        blockedUntil: new Date(blockEntry.blockedUntil).toISOString()
      });
    }
    
    blockedIpStore.set(ip, blockEntry);
    
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { 
      count: entry.count,
      path: req.path
    });
    
    return res.status(429).json({
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE.toString());
  res.setHeader('X-RateLimit-Remaining', (SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE - entry.count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
  
  next();
};

/**
 * Security Headers Middleware
 * 
 * Adds security-related HTTP headers to responses
 */
export const securityHeadersMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  next();
};

/**
 * CSRF Protection Middleware
 * 
 * Generates and validates CSRF tokens
 */
export const generateCsrfToken = (req: Request): string => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store token with expiry time
  csrfTokens.set(token, Date.now() + SECURITY_CONFIG.CSRF_TOKEN_EXPIRY);
  
  // We're not using session-based CSRF for now
  // Just store tokens in memory map
  
  return token;
};

export const validateCsrfToken = (req: Request): boolean => {
  const token = req.headers['x-csrf-token'] as string || 
                req.body._csrf ||
                req.query._csrf as string;
  
  // No token provided
  if (!token) {
    return false;
  }
  
  // Check if token exists and is not expired
  const expiry = csrfTokens.get(token);
  if (!expiry || expiry < Date.now()) {
    return false;
  }
  
  // We're not checking against session tokens
  
  // Token is valid, delete it to prevent reuse
  csrfTokens.delete(token);
  
  return true;
};

export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // For GET requests, generate a new token and send it in response header
    if (req.method === 'GET') {
      const token = generateCsrfToken(req);
      res.setHeader('X-CSRF-Token', token);
    }
    return next();
  }
  
  // Skip CSRF protection for authentication-related endpoints and paybill operations
  // This is a security trade-off to allow basic authentication and payment operations without tokens
  if (
    req.path.includes('/api/vendor/login') || 
    req.path.includes('/api/login') || 
    req.path.includes('/api/register') ||
    req.path.includes('/api/auth/') ||
    req.path.includes('/api/paybill/') || // Allow paybill operations
    req.path.startsWith('/vendor-login') ||
    req.path.startsWith('/vendor-access') ||
    req.path.startsWith('/tesco-vendor')
  ) {
    console.log('Skipping CSRF check for auth/paybill endpoint:', req.path);
    return next();
  }
  
  // For other methods (POST, PUT, DELETE, etc.), validate the token
  if (!validateCsrfToken(req)) {
    const ip = getIpAddress(req);
    logSecurityEvent('CSRF_VALIDATION_FAILED', ip, { 
      path: req.path,
      method: req.method
    });
    
    return res.status(403).json({
      error: 'CSRF token validation failed',
      code: 'INVALID_CSRF_TOKEN'
    });
  }
  
  next();
};

/**
 * SQL Injection Protection
 * 
 * Checks request parameters for potential SQL injection patterns
 */
export const sqlInjectionProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // SQL injection patterns to check for
  const sqlPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /'\s*OR\s*1\s*=\s*1/i,
    /'\s*;\s*DROP\s+TABLE/i,
    /'\s*;\s*DELETE\s+FROM/i,
    /'\s*UNION\s+SELECT/i,
    /'\s*INSERT\s+INTO/i,
    /'\s*UPDATE\s+.*\s+SET/i,
    /'\s*SELECT\s+.*\s+FROM/i,
    /--/
  ];
  
  // Function to check a value for SQL injection patterns
  const checkForSqlInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  // Check request parameters
  const checkParams = (obj: any): boolean => {
    if (!obj) return false;
    
    for (const key in obj) {
      const value = obj[key];
      
      if (typeof value === 'object') {
        if (checkParams(value)) return true;
      } else if (checkForSqlInjection(value)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Check all request parameters for SQL injection patterns
  if (
    checkParams(req.query) || 
    checkParams(req.body) || 
    checkParams(req.params)
  ) {
    const ip = getIpAddress(req);
    logSecurityEvent('SQL_INJECTION_ATTEMPT', ip, {
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body,
      params: req.params
    });
    
    // Increment failed attempts for this IP
    let blockEntry = blockedIpStore.get(ip) || { failedAttempts: 0 };
    blockEntry.failedAttempts++;
    
    // Block IP if too many failed attempts
    if (blockEntry.failedAttempts >= SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
      blockEntry.blockedUntil = Date.now() + SECURITY_CONFIG.BLOCK_DURATION;
    }
    
    blockedIpStore.set(ip, blockEntry);
    
    return res.status(403).json({
      error: 'Potentially malicious request detected',
      code: 'MALICIOUS_REQUEST'
    });
  }
  
  next();
};

/**
 * Authentication Verification Middleware
 * 
 * Checks if the user is authenticated for protected routes
 */
export const authVerificationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if route should be protected
  const protectedPaths = [
    '/api/user',
    '/api/admin',
    '/api/payments',
    '/api/dashboard'
  ];
  
  const isProtectedPath = protectedPaths.some(path => req.path.startsWith(path));
  
  if (!isProtectedPath) {
    return next();
  }
  
  // Check if user is authenticated
  // This is a simplified version as we don't have authentication system yet
  // We'll assume no users are authenticated for now
  return res.status(401).json({
    error: 'Authentication required',
    code: 'AUTHENTICATION_REQUIRED'
  });
  
  next();
};

/**
 * Combine all security middleware into a single middleware
 */
export const securityMiddleware = [
  rateLimitMiddleware,
  securityHeadersMiddleware,
  csrfProtectionMiddleware,
  sqlInjectionProtectionMiddleware,
  authVerificationMiddleware
];

/**
 * Error handling middleware for security-related errors
 */
export const securityErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'SecurityError') {
    const ip = getIpAddress(req);
    logSecurityEvent('SECURITY_ERROR', ip, {
      error: err.message,
      path: req.path,
      method: req.method
    });
    
    return res.status(403).json({
      error: 'Security violation detected',
      code: 'SECURITY_VIOLATION',
      message: process.env.NODE_ENV === 'production' ? 'Access denied' : err.message
    });
  }
  
  next(err);
};

/**
 * Clean expired entries from rate limit and blocked IP stores
 */
const cleanupStores = () => {
  const now = Date.now();
  
  // Clean up rate limit store
  // Using Array.from to avoid ES module iterator issues
  Array.from(rateLimitStore.entries()).forEach(([ip, entry]) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(ip);
    }
  });
  
  // Clean up blocked IP store
  Array.from(blockedIpStore.entries()).forEach(([ip, entry]) => {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      blockedIpStore.delete(ip);
    }
  });
  
  // Clean up CSRF tokens
  Array.from(csrfTokens.entries()).forEach(([token, expiry]) => {
    if (expiry < now) {
      csrfTokens.delete(token);
    }
  });
};

// Run cleanup every hour
setInterval(cleanupStores, 3600000);

export default {
  rateLimitMiddleware,
  securityHeadersMiddleware,
  csrfProtectionMiddleware,
  sqlInjectionProtectionMiddleware,
  authVerificationMiddleware,
  securityMiddleware,
  securityErrorHandler,
  getIpAddress,
  generateCsrfToken,
  validateCsrfToken,
};