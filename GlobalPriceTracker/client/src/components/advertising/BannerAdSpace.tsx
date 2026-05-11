import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

interface BannerAdSpaceProps {
  id: string;
  size: 'small' | 'medium' | 'large' | 'leaderboard';
  position: 'top' | 'sidebar' | 'inline' | 'footer';
  currentAd?: {
    imageUrl: string;
    targetUrl: string;
    altText: string;
    advertiserName: string;
    isExternal: boolean;
  };
  isAvailable?: boolean;
  className?: string;
}

/**
 * BannerAdSpace Component
 * 
 * Displays advertising banner spaces that can be purchased by businesses
 * Shows either a current ad or a placeholder with information about purchasing the space
 */
const BannerAdSpace: React.FC<BannerAdSpaceProps> = ({
  id,
  size,
  position,
  currentAd,
  isAvailable = true,
  className = ''
}) => {
  // Set dimensions based on size
  const dimensions = {
    small: { width: 300, height: 100, className: 'h-[100px]' },
    medium: { width: 300, height: 250, className: 'h-[250px]' },
    large: { width: 300, height: 600, className: 'h-[600px]' },
    leaderboard: { width: 728, height: 90, className: 'h-[90px] w-full max-w-[728px]' }
  }[size];
  
  // If there's a current ad, show it
  if (currentAd) {
    if (currentAd.isExternal) {
      return (
        <a 
          href={currentAd.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block ${dimensions.className} ${className}`}
          onClick={() => {
            // Track ad click for analytics
            try {
              if (window.gtag) {
                window.gtag('event', 'ad_click', {
                  ad_id: id,
                  ad_position: position,
                  ad_size: size,
                  advertiser: currentAd.advertiserName
                });
              }
            } catch (error) {
              console.error('Error tracking ad click:', error);
            }
          }}
        >
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.altText}
            className="w-full h-full object-cover"
          />
        </a>
      );
    } else {
      return (
        <Link 
          href={currentAd.targetUrl}
          className={`block ${dimensions.className} ${className}`}
          onClick={() => {
            // Track ad click for analytics
            try {
              if (window.gtag) {
                window.gtag('event', 'ad_click', {
                  ad_id: id,
                  ad_position: position,
                  ad_size: size,
                  advertiser: currentAd.advertiserName
                });
              }
            } catch (error) {
              console.error('Error tracking ad click:', error);
            }
          }}
        >
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.altText}
            className="w-full h-full object-cover"
          />
        </Link>
      );
    }
  }
  
  // If no current ad, show available space placeholder
  return (
    <Card className={`overflow-hidden ${dimensions.className} ${className} flex items-center justify-center`}>
      <CardContent className="p-4 text-center">
        {isAvailable ? (
          <>
            <p className="text-sm font-medium mb-2">Advertising Space Available</p>
            <p className="text-xs text-muted-foreground mb-3">
              {size} banner ({dimensions.width}x{dimensions.height})
            </p>
            <Link href="/advertise">
              <span className="text-xs text-primary font-medium inline-flex items-center">
                Purchase This Space
                <ExternalLink className="w-3 h-3 ml-1" />
              </span>
            </Link>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Ad space reserved</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerAdSpace;