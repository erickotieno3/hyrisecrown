/**
 * Email Service
 * 
 * Handles sending emails for various purposes including 2FA verification codes.
 * Uses nodemailer for sending emails through standard SMTP.
 */

import nodemailer from 'nodemailer';

// Create a transporter with default settings
// In production, replace with actual SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  // For testing/development, use ethereal.email service to avoid sending real emails
  ...(process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER && {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal_pass',
    },
  }),
});

// Store verification codes with timestamps
interface VerificationEntry {
  code: string;
  expires: Date;
}

// In-memory storage for verification codes
// In production, consider using Redis or database storage
const verificationCodes: Map<string, VerificationEntry> = new Map();

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send a verification code via email
 * @param email The recipient's email address
 * @param username The recipient's username
 * @returns Promise that resolves to the verification code
 */
export async function sendVerificationCode(email: string, username?: string): Promise<string> {
  const code = generateVerificationCode();
  
  // Store the verification code with a 10-minute expiry time
  verificationCodes.set(email, {
    code,
    expires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  });
  
  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Hyrise Crown Price Compare <erickotienokjv@gmail.com>',
    to: email,
    subject: 'Your Verification Code for Tesco Price Comparison',
    text: `Hello ${username || ''},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nRegards,\nTesco Price Comparison Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://hyrisecrown.com/assets/tesco-logo.svg" alt="Tesco Logo" style="max-width: 150px;" />
        </div>
        <h2 style="color: #00539f;">Your Verification Code</h2>
        <p>Hello ${username || ''},</p>
        <p>Your verification code for Tesco Price Comparison is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
          <strong>${code}</strong>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email or contact support if you're concerned.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Tesco Price Comparison. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_USER) {
      // For development, log the Ethereal URL to view the email
      console.log('Verification email preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return code;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Verify a verification code
 * @param email The email associated with the verification code
 * @param code The verification code to check
 * @returns Boolean indicating if the code is valid
 */
export function verifyCode(email: string, code: string): boolean {
  const entry = verificationCodes.get(email);
  
  if (!entry) {
    return false;
  }
  
  // Check if code is expired
  if (new Date() > entry.expires) {
    verificationCodes.delete(email); // Clean up expired code
    return false;
  }
  
  // Verify the code
  const isValid = entry.code === code;
  
  if (isValid) {
    verificationCodes.delete(email); // Clean up used code
  }
  
  return isValid;
}

export default {
  sendVerificationCode,
  verifyCode,
  generateVerificationCode
};