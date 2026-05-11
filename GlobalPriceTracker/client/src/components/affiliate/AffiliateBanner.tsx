import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Percent, TrendingUp, Tag } from 'lucide-react';
import AffiliateLink from './AffiliateLink';

interface AffiliateBannerProps {
  storeId: number;
  productId?: number;
  title: string;
  description: string;
  bannerUrl: string;
  discountPercentage?: number;
  discountCode?: string;
  className?: string;
}

/**
 * AffiliateBanner Component
 * 
 * Displays a promotional banner for affiliate marketing with tracking capabilities.
 * Used for special offers, discounts, or featured products/stores.
 * 
 * @example
 * <AffiliateBanner
 *   storeId={1}
 *   title="Spring Sale at Tesco"
 *   description="Save up to 30% on grocery essentials"
 *   bannerUrl="https://tesco.com/spring-sale"
 *   discountPercentage={30}
 *   discountCode="SPRING30"
 * />
 */
const AffiliateBanner: React.FC<AffiliateBannerProps> = ({
  storeId,
  productId,
  title,
  description,
  bannerUrl,
  discountPercentage,
  discountCode,
  className = ''
}) => {
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <AffiliateLink 
        to={bannerUrl}
        storeId={storeId}
        productId={productId}
        className="block"
      >
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
              
              {(discountPercentage || discountCode) && (
                <div className="flex flex-wrap gap-3">
                  {discountPercentage && (
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                      <Percent className="h-3.5 w-3.5" />
                      <span>Save {discountPercentage}%</span>
                    </div>
                  )}
                  
                  {discountCode && (
                    <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full text-sm">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Code: <strong>{discountCode}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end ml-4">
              <div className="bg-primary text-white p-2 rounded-full">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="mt-auto">
                <div className="text-sm font-medium text-primary mt-4 flex items-center">
                  Shop Now
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 16 16" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1"
                  >
                    <path 
                      d="M5.33325 10.6667L10.6666 5.33337" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M5.33325 5.33337H10.6666V10.6667" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </AffiliateLink>
    </Card>
  );
};

export default AffiliateBanner;