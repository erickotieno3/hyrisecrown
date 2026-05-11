/**
 * IP Blocker and Intrusion Detection System
 * 
 * This module provides functionality to detect and block suspicious IP addresses
 * based on access patterns, failed login attempts, and other security criteria.
 */

import fs from 'fs';
import path from 'path';
import { getIpAddress } from './security';
import type { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';

// Get directory name equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // IP blocking thresholds
  MAX_FAILED_LOGINS: 5,
  MAX_API_ERRORS: 10,
  MAX_BANNED_ROUTE_ATTEMPTS: 3,
  
  // Blocking durations (in milliseconds)
  SHORT_BLOCK_DURATION: 1 * 60 * 60 * 1000, // 1 hour
  MEDIUM_BLOCK_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  LONG_BLOCK_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  PERMANENT_BLOCK_DURATION: 365 * 24 * 60 * 60 * 1000, // 1 year (practically permanent)
  
  // Paths that require special monitoring
  SENSITIVE_PATHS: [
    '/api/payments',
    '/api/admin',
    '/api/user',
    '/checkout',
    '/login',
  ],
  
  // Patterns that indicate potential attacks
  SUSPICIOUS_PATTERNS: [
    /\/wp-admin/i, // WordPress admin access attempts
    /\/administrator/i, // Joomla admin access attempts
    /\/phpmyadmin/i, // phpMyAdmin access attempts
    /\.php$/i, // PHP file access attempts
    /\.asp$/i, // ASP file access attempts
    /\/config/i, // Configuration file access attempts
    /\/etc\/passwd/i, // Linux passwd file access attempts
    /\/\.env/i, // .env file access attempts
  ],
};

// Store for blocked IPs
interface BlockedIP {
  ip: string;
  reason: string;
  blockedUntil: number;
  offenses: string[];
}

// In-memory storage for blocked IPs
const blockedIPs: Map<string, BlockedIP> = new Map();
const failedLogins: Map<string, number> = new Map();
const apiErrors: Map<string, number> = new Map();
const suspiciousActivities: Map<string, number> = new Map();

// Log file paths
const logsDir = path.join(__dirname, '..', 'logs');
const blockedIPsLogPath = path.join(logsDir, 'blocked-ips.log');
const securityLogPath = path.join(logsDir, 'security.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log security events to file
 */
const logSecurityEvent = (event: string, ip: string, details: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${event} | IP: ${ip} | ${JSON.stringify(details)}\n`;
  
  fs.appendFile(securityLogPath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to security log:', err);
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Security Event | ${event} | IP: ${ip}`);
  }
};

/**
 * Check if an IP is currently blocked
 */
export const isIPBlocked = (ip: string): boolean => {
  const entry = blockedIPs.get(ip);
  if (!entry) return false;
  
  // Check if block has expired
  if (entry.blockedUntil < Date.now()) {
    blockedIPs.delete(ip);
    logSecurityEvent('BLOCK_EXPIRED', ip, { reason: entry.reason });
    return false;
  }
  
  return true;
};

/**
 * Block an IP address with a reason
 */
export const blockIP = (ip: string, reason: string, duration: number = CONFIG.MEDIUM_BLOCK_DURATION): void => {
  const now = Date.now();
  const blockedUntil = now + duration;
  
  // Check if IP is already blocked
  const existingEntry = blockedIPs.get(ip);
  if (existingEntry) {
    // Extend the block duration and add new offense
    existingEntry.blockedUntil = Math.max(existingEntry.blockedUntil, blockedUntil);
    existingEntry.offenses.push(reason);
    blockedIPs.set(ip, existingEntry);
    
    logSecurityEvent('BLOCK_EXTENDED', ip, {
      reason,
      blockedUntil: new Date(existingEntry.blockedUntil).toISOString(),
      offenseCount: existingEntry.offenses.length
    });
  } else {
    // Create new block entry
    const entry: BlockedIP = {
      ip,
      reason,
      blockedUntil,
      offenses: [reason]
    };
    blockedIPs.set(ip, entry);
    
    logSecurityEvent('IP_BLOCKED', ip, {
      reason,
      blockedUntil: new Date(blockedUntil).toISOString()
    });
  }
  
  // Log to blocked IPs file
  const logEntry = `${new Date().toISOString()} | IP: ${ip} | Reason: ${reason} | Blocked until: ${new Date(blockedUntil).toISOString()}\n`;
  fs.appendFile(blockedIPsLogPath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to blocked IPs log:', err);
    }
  });
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = (ip: string): void => {
  const count = (failedLogins.get(ip) || 0) + 1;
  failedLogins.set(ip, count);
  
  logSecurityEvent('FAILED_LOGIN', ip, { count });
  
  // Block IP if too many failed login attempts
  if (count >= CONFIG.MAX_FAILED_LOGINS) {
    blockIP(ip, `${count} failed login attempts`, CONFIG.SHORT_BLOCK_DURATION);
    failedLogins.delete(ip);
  }
};

/**
 * Record an API error
 */
export const recordApiError = (ip: string, statusCode: number, path: string): void => {
  const count = (apiErrors.get(ip) || 0) + 1;
  apiErrors.set(ip, count);
  
  logSecurityEvent('API_ERROR', ip, { statusCode, path, count });
  
  // Block IP if too many API errors (potential scanning/probing)
  if (count >= CONFIG.MAX_API_ERRORS) {
    blockIP(ip, `${count} API errors (${statusCode})`, CONFIG.SHORT_BLOCK_DURATION);
    apiErrors.delete(ip);
  }
};

/**
 * Record suspicious activity
 */
export const recordSuspiciousActivity = (ip: string, activity: string, path: string): void => {
  const count = (suspiciousActivities.get(ip) || 0) + 1;
  suspiciousActivities.set(ip, count);
  
  logSecurityEvent('SUSPICIOUS_ACTIVITY', ip, { activity, path, count });
  
  // Block IP if showing persistent suspicious behavior
  if (count >= 3) {
    blockIP(ip, `Multiple suspicious activities: ${activity}`, CONFIG.MEDIUM_BLOCK_DURATION);
    suspiciousActivities.delete(ip);
  }
};

/**
 * Check if a path matches any suspicious patterns
 */
const matchesSuspiciousPattern = (path: string): boolean => {
  return CONFIG.SUSPICIOUS_PATTERNS.some(pattern => pattern.test(path));
};

/**
 * IP Blocker Middleware
 * 
 * Checks if the requesting IP is blocked and detects suspicious activities
 */
export const ipBlockerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = getIpAddress(req);
  const path = req.path;
  
  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    const entry = blockedIPs.get(ip)!;
    logSecurityEvent('BLOCKED_REQUEST', ip, { 
      path, 
      reason: entry.reason,
      blockedUntil: new Date(entry.blockedUntil).toISOString()
    });
    
    return res.status(403).json({
      error: 'Access denied due to suspicious activity',
      code: 'IP_BLOCKED'
    });
  }
  
  // Check for suspicious path patterns
  if (matchesSuspiciousPattern(path)) {
    recordSuspiciousActivity(ip, 'Suspicious URL pattern', path);
    
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND'
    });
  }
  
  // Check for sensitive paths
  if (CONFIG.SENSITIVE_PATHS.some(prefix => path.startsWith(prefix))) {
    // Just log access to sensitive paths, but don't block
    logSecurityEvent('SENSITIVE_PATH_ACCESS', ip, { path });
  }
  
  // Add response hook to detect API errors
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    if (res.statusCode >= 400) {
      recordApiError(ip, res.statusCode, path);
    }
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * Load previously blocked IPs from file (if any)
 */
export const loadBlockedIPs = (): void => {
  if (fs.existsSync(blockedIPsLogPath)) {
    try {
      const content = fs.readFileSync(blockedIPsLogPath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const match = line.match(/IP: ([\d\.]+) \| Reason: (.+) \| Blocked until: (.+)/);
        if (match) {
          const [_, ip, reason, blockedUntilStr] = match;
          const blockedUntil = new Date(blockedUntilStr).getTime();
          
          // Only load if block hasn't expired
          if (blockedUntil > Date.now()) {
            blockedIPs.set(ip, {
              ip,
              reason,
              blockedUntil,
              offenses: [reason]
            });
            
            console.log(`Loaded blocked IP: ${ip} until ${blockedUntilStr}`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load blocked IPs:', err);
    }
  }
};

/**
 * Clean up expired blocks and counters periodically
 */
const cleanupBlocks = () => {
  const now = Date.now();
  
  // Clean up expired IP blocks
  // Using Array.from to avoid ES module iterator issues
  Array.from(blockedIPs.entries()).forEach(([ip, entry]) => {
    if (entry.blockedUntil < now) {
      blockedIPs.delete(ip);
      logSecurityEvent('BLOCK_EXPIRED', ip, { reason: entry.reason });
    }
  });
  
  // Reset counters older than 24 hours
  // (In a production system, these would have timestamps)
  failedLogins.clear();
  apiErrors.clear();
  suspiciousActivities.clear();
};

// Run cleanup every hour
setInterval(cleanupBlocks, 60 * 60 * 1000);

// Export functions
export default {
  ipBlockerMiddleware,
  isIPBlocked,
  blockIP,
  recordFailedLogin,
  recordApiError,
  recordSuspiciousActivity,
  loadBlockedIPs
};