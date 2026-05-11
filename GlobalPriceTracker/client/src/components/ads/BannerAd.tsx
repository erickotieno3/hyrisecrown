import React from 'react';
import AdUnit from './AdUnit';
import { AdPosition } from '@/lib/adsense';

interface BannerAdProps {
  className?: string;
}

/**
 * Banner Advertisement Component
 * 
 * This component displays a responsive banner advertisement
 * typically used in header or footer areas.
 */
export function BannerAd({ className }: BannerAdProps) {
  return (
    <div className={`w-full my-4 ${className || ''}`}>
      <AdUnit 
        position={AdPosition.HEADER} 
        style={{ 
          minHeight: '90px',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem'
        }} 
      />
    </div>
  );
}

export default BannerAd;