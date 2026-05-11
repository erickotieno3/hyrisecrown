/**
 * Affiliate Marketing Utilities
 * 
 * This module contains utilities for tracking affiliate marketing activity,
 * managing affiliate IDs, and handling commission attribution.
 */
import { apiRequest } from './queryClient';
import { trackAffiliateClick as trackAffiliateClickAnalytics } from './analytics';

// Define the affiliate click props interface
export interface AffiliateClickProps {
  storeName: string;
  productId?: number;
  productName?: string;
  productUrl: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Track affiliate clicks with affiliate ID and return tracking URL
 */
export function trackAffiliateClick(
  storeName: string,
  productId?: number,
  productName?: string,
  productUrl?: string
): string {
  // Track with analytics
  trackAffiliateClickAnalytics(storeName, productId, productName);
  
  // If we have a URL, append affiliate tracking params
  if (productUrl) {
    const url = new URL(productUrl);
    const affiliateId = getAffiliateId();
    
    // Add our tracking parameters
    url.searchParams.append('utm_source', 'tesco-price-comparison');
    url.searchParams.append('utm_medium', 'affiliate');
    url.searchParams.append('utm_campaign', storeName.toLowerCase());
    
    if (affiliateId) {
      url.searchParams.append('aff', affiliateId);
    }
    
    if (productId) {
      url.searchParams.append('pid', productId.toString());
    }
    
    return url.toString();
  }
  
  // If no URL provided, just return empty string
  return '';
}

/**
 * Check if the current user accessed the site via an affiliate link
 * and store the affiliate ID if present
 */
export function checkAndStoreAffiliateId(): void {
  try {
    // Check URL parameters for affiliate ID
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateId = urlParams.get('aff') || urlParams.get('affiliateId');
    
    if (affiliateId) {
      // Store the affiliate ID for attribution
      localStorage.setItem('affiliateId', affiliateId);
      localStorage.setItem('affiliateTimestamp', Date.now().toString());
      
      // Record the referral
      recordReferral(affiliateId);
      
      // Clean up URL by removing affiliate parameters
      // Only in production to avoid interfering with development
      if (import.meta.env.PROD) {
        const newUrl = removeAffiliateParamsFromUrl(window.location.href);
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  } catch (error) {
    console.error('Error processing affiliate ID:', error);
  }
}

/**
 * Record a referral from an affiliate
 */
async function recordReferral(affiliateId: string): Promise<void> {
  try {
    await apiRequest('POST', '/api/affiliate/referral', {
      affiliateId,
      referrer: document.referrer || 'direct',
      landingPage: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording affiliate referral:', error);
  }
}

/**
 * Get the current active affiliate ID
 */
export function getAffiliateId(): string | null {
  try {
    const affiliateId = localStorage.getItem('affiliateId');
    const timestamp = localStorage.getItem('affiliateTimestamp');
    
    // Check if the affiliate ID is still valid (30-day attribution window)
    if (affiliateId && timestamp) {
      const storedTime = parseInt(timestamp, 10);
      const currentTime = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      
      if (currentTime - storedTime <= thirtyDaysInMs) {
        return affiliateId;
      } else {
        // Clear expired affiliate ID
        localStorage.removeItem('affiliateId');
        localStorage.removeItem('affiliateTimestamp');
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting affiliate ID:', error);
    return null;
  }
}

/**
 * Track a purchase for affiliate commission
 */
export async function trackAffiliatePurchase(
  orderId: string,
  amount: number,
  currency: string
): Promise<void> {
  const affiliateId = getAffiliateId();
  
  if (affiliateId) {
    try {
      await apiRequest('POST', '/api/affiliate/conversion', {
        affiliateId,
        orderId,
        amount,
        currency,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking affiliate purchase:', error);
    }
  }
}

/**
 * Remove affiliate parameters from a URL
 */
function removeAffiliateParamsFromUrl(url: string): string {
  const urlObj = new URL(url);
  urlObj.searchParams.delete('aff');
  urlObj.searchParams.delete('affiliateId');
  return urlObj.toString();
}

/**
 * Initialize affiliate tracking
 * Call this when the application starts
 */
export function initializeAffiliateTracking(): void {
  // Check for affiliate ID in URL parameters
  checkAndStoreAffiliateId();
  
  // Track page views for analytics
  window.addEventListener('load', () => {
    trackAffiliatePageView();
  });
}

/**
 * Track a page view for affiliate analytics
 */
async function trackAffiliatePageView(): Promise<void> {
  const affiliateId = getAffiliateId();
  
  if (affiliateId) {
    try {
      await apiRequest('POST', '/api/affiliate/pageview', {
        affiliateId,
        path: window.location.pathname,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silent fail for pageview tracking
      console.debug('Error tracking affiliate pageview:', error);
    }
  }
}