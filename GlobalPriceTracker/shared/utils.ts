/**
 * Shared utility functions for both client and server
 */

/**
 * Convert a string to a URL-friendly slug
 * 
 * @param input String to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format a price with the correct currency symbol and formatting
 * 
 * @param price Price value
 * @param currency Currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string): string {
  if (!price) return '-';
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    HKD: 'HK$',
    NZD: 'NZ$',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh',
    ZAR: 'R',
    INR: '₹',
    RUB: '₽',
    BRL: 'R$',
    KRW: '₩',
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  try {
    return formatter.format(price);
  } catch (e) {
    // Fallback for issues with Intl formatter
    return `${symbol}${price.toFixed(2)}`;
  }
}

/**
 * Calculate percentage change between two numbers
 * 
 * @param oldValue Original value
 * @param newValue New value
 * @returns Percentage change (negative for decrease, positive for increase)
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Format a date in a localized way
 * 
 * @param date Date to format
 * @param locale Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncate a string to a maximum length, adding ellipsis if truncated
 * 
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Generate a random string (useful for IDs, etc.)
 * 
 * @param length Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a string is a valid email address
 * 
 * @param email Email address to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate time remaining until a future date
 * 
 * @param targetDate Target date
 * @returns Object with days, hours, minutes, seconds
 */
export function getTimeRemaining(targetDate: Date): { 
  days: number; 
  hours: number; 
  minutes: number; 
  seconds: number; 
  total: number;
} {
  const total = targetDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds, total };
}