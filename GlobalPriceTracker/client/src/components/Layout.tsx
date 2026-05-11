import React, { ReactNode } from 'react';
import { BannerAd } from './ads';
import LegalDisclaimer from './LegalDisclaimer';

interface LayoutProps {
  children: ReactNode;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
  showDisclaimer?: boolean;
}

/**
 * Layout Component
 * 
 * Provides a consistent layout for pages including optional header and footer ads
 * and a legal disclaimer.
 */
export function Layout({
  children,
  showHeaderAd = true,
  showFooterAd = true,
  showDisclaimer = true
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header ad */}
      {showHeaderAd && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <BannerAd />
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer ad and disclaimer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {showFooterAd && <BannerAd className="mb-6" />}
        
        {showDisclaimer && <LegalDisclaimer />}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tesco Price Comparison. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;