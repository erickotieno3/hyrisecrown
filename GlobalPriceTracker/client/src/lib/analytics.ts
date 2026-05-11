/**
 * Analytics Service
 * 
 * This module provides analytics tracking capabilities for the application
 * by integrating with Google Analytics and supporting custom event tracking.
 */

// Define event types that we'll track in the app
export type AnalyticsEvent = 
  | 'page_view'
  | 'product_view'
  | 'store_view'
  | 'price_comparison'
  | 'app_download'
  | 'affiliate_click'
  | 'newsletter_signup'
  | 'search'
  | 'country_selection'
  | 'language_selection'
  | 'payment_initiated'
  | 'payment_completed';

// Define parameter types that can be passed with events
export interface AnalyticsEventParams {
  // Common parameters
  [key: string]: any;
  
  // Specific typings for known parameters
  product_id?: number;
  product_name?: string;
  store_id?: number;
  store_name?: string;
  country_code?: string;
  country_name?: string;
  language_code?: string;
  category_id?: number;
  category_name?: string;
  search_term?: string;
  platform?: 'web' | 'android' | 'ios';
  price?: number;
  currency?: string;
  affiliate_store?: string;
}

// Extend window interface to include Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Initialize Google Analytics
 * 
 * Call this function once when the application loads
 */
export const initializeAnalytics = (): void => {
  const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
  
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID is not defined. Analytics will not be initialized.');
    return;
  }
  // Create script element for Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize the data layer and configure GA
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  window.gtag('js', new Date().toISOString());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
    anonymize_ip: true,    // GDPR compliance
    cookie_flags: 'SameSite=None;Secure', // For cross-site context
  });
  
  console.log('Analytics initialized with ID:', measurementId);
};

/**
 * Track a page view event
 * 
 * @param path The page path (e.g., '/products/123')
 * @param title The page title
 */
export const trackPageView = (path: string, title: string): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href
  });
  
  console.log('Page view tracked:', path);
};

/**
 * Track a custom event
 * 
 * @param eventName The name of the event to track
 * @param params Additional parameters for the event
 */
export const trackEvent = (
  eventName: AnalyticsEvent, 
  params: AnalyticsEventParams = {}
): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, params);
  console.log('Event tracked:', eventName, params);
};

/**
 * Track an affiliate link click
 * 
 * @param storeName The name of the store (e.g., 'Tesco')
 * @param productId Optional product ID if click is product-specific
 * @param productName Optional product name if click is product-specific
 */
export const trackAffiliateClick = (
  storeName: string,
  productId?: number,
  productName?: string,
): void => {
  const params: AnalyticsEventParams = {
    affiliate_store: storeName,
  };
  
  if (productId) params.product_id = productId;
  if (productName) params.product_name = productName;
  
  trackEvent('affiliate_click', params);
};

/**
 * Track app download clicks
 * 
 * @param platform 'android' or 'ios'
 */
export const trackAppDownload = (platform: 'android' | 'ios'): void => {
  trackEvent('app_download', { platform });
};

/**
 * Set user properties (for logged-in users)
 * 
 * @param userId Unique identifier for the user
 * @param properties Additional user properties
 */
export const setUserProperties = (
  userId: string,
  properties: Record<string, any> = {}
): void => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('set', 'user_properties', {
    user_id: userId,
    ...properties
  });
  
  console.log('User properties set for user:', userId);
};

// Export a default object with all functions
export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackAffiliateClick,
  trackAppDownload,
  setUserProperties
};