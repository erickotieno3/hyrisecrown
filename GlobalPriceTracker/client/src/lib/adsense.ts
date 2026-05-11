/**
 * Google AdSense Integration
 * 
 * This module provides utilities for integrating Google AdSense ads
 * throughout the application.
 */

// AdSense publisher ID from environment variables
export const ADSENSE_CLIENT_ID = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;

// Common ad unit formats
export enum AdFormat {
  RESPONSIVE = 'responsive',
  DISPLAY = 'display',
  IN_ARTICLE = 'in-article',
  IN_FEED = 'in-feed',
  MATCHED_CONTENT = 'matched-content',
}

// Common ad slot positions
export enum AdPosition {
  HEADER = 'header',
  FOOTER = 'footer',
  SIDEBAR = 'sidebar',
  IN_CONTENT = 'in-content',
  BETWEEN_PRODUCTS = 'between-products',
  PRODUCT_PAGE = 'product-page',
  AFTER_SEARCH = 'after-search',
}

// Ad slot configuration
export interface AdSlotConfig {
  format: AdFormat;
  position: AdPosition;
  slotId: string;
}

// Define standard ad slots
export const AD_SLOTS: Record<AdPosition, AdSlotConfig> = {
  [AdPosition.HEADER]: {
    format: AdFormat.RESPONSIVE,
    position: AdPosition.HEADER,
    slotId: 'header-ad',
  },
  [AdPosition.FOOTER]: {
    format: AdFormat.RESPONSIVE,
    position: AdPosition.FOOTER,
    slotId: 'footer-ad',
  },
  [AdPosition.SIDEBAR]: {
    format: AdFormat.DISPLAY,
    position: AdPosition.SIDEBAR,
    slotId: 'sidebar-ad',
  },
  [AdPosition.IN_CONTENT]: {
    format: AdFormat.IN_ARTICLE,
    position: AdPosition.IN_CONTENT,
    slotId: 'in-content-ad',
  },
  [AdPosition.BETWEEN_PRODUCTS]: {
    format: AdFormat.IN_FEED,
    position: AdPosition.BETWEEN_PRODUCTS,
    slotId: 'between-products-ad',
  },
  [AdPosition.PRODUCT_PAGE]: {
    format: AdFormat.RESPONSIVE,
    position: AdPosition.PRODUCT_PAGE,
    slotId: 'product-page-ad',
  },
  [AdPosition.AFTER_SEARCH]: {
    format: AdFormat.MATCHED_CONTENT,
    position: AdPosition.AFTER_SEARCH,
    slotId: 'after-search-ad',
  },
};

// Initialize AdSense script
export function initializeAdSense() {
  // Check if AdSense is already initialized
  if (document.querySelector('script[src*="adsbygoogle"]')) {
    return;
  }

  // Create and add the AdSense script
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// Push ad display commands
export function displayAd(slotId: string) {
  if (window.adsbygoogle) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      console.log(`Displayed ad in slot: ${slotId}`);
    } catch (error) {
      console.error(`Error displaying AdSense ad in slot ${slotId}:`, error);
    }
  } else {
    console.warn('AdSense not initialized yet. Ad display request queued.');
  }
}

// Declare global AdSense types
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}