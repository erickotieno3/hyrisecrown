import React, { useEffect, useRef } from 'react';
import { AdFormat, AdPosition, AD_SLOTS, displayAd } from '@/lib/adsense';

interface AdUnitProps {
  position: AdPosition;
  format?: AdFormat;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AdUnit Component
 * 
 * Renders a Google AdSense advertisement unit at the specified position.
 * This component handles the display of ads in different formats and positions.
 */
export function AdUnit({ position, format, className, style }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const slotConfig = AD_SLOTS[position];
  const adFormat = format || slotConfig.format;
  
  useEffect(() => {
    // Attempt to display the ad when the component mounts
    if (adRef.current) {
      displayAd(slotConfig.slotId);
    }
    
    // Clean up function if needed
    return () => {
      // Any cleanup code for ads if necessary
    };
  }, [slotConfig.slotId]);
  
  // Determine classes based on ad format
  const getAdClasses = () => {
    const baseClasses = 'adsbygoogle';
    const formatClasses = adFormat === AdFormat.IN_ARTICLE 
      ? 'adsbygoogle-in-article' 
      : adFormat === AdFormat.IN_FEED 
        ? 'adsbygoogle-in-feed'
        : '';
    
    return `${baseClasses} ${formatClasses} ${className || ''}`.trim();
  };
  
  return (
    <div className="ad-container" data-position={position}>
      <div ref={adRef}>
        <ins
          className={getAdClasses()}
          style={{
            display: 'block',
            textAlign: 'center',
            ...style
          }}
          data-ad-client={import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID}
          data-ad-slot={slotConfig.slotId}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
      <div className="ad-label text-xs text-gray-400 text-center mt-1">Advertisement</div>
    </div>
  );
}

export default AdUnit;