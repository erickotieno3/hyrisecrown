import React from 'react';
import { trackAffiliateClick, type AffiliateClickProps } from '@/lib/affiliate';

/**
 * AffiliateLink Component
 * 
 * A component for creating tracking links to retailer websites.
 * This component adds affiliate tracking and analytics.
 */
const AffiliateLink: React.FC<AffiliateClickProps> = ({
  storeName,
  productId,
  productName,
  productUrl,
  className = '',
  children
}) => {
  const handleClick = () => {
    // Track the click with analytics
    trackAffiliateClick(storeName, productId, productName);
    
    // Optional: You can open in a new window with specific dimensions
    // window.open(productUrl, '_blank', 'width=1200,height=800');
    // return false; // Prevent default action
  };

  return (
    <a 
      href={productUrl}
      className={className}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer sponsored"
      data-affiliate="true"
      data-store={storeName}
      data-product-id={productId}
    >
      {children}
    </a>
  );
};

/**
 * AffiliateBanner Component
 * 
 * A component that displays a banner to indicate
 * that affiliate links are being used on the page.
 */
export const AffiliateBanner: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 mt-2 mb-4 p-2 bg-gray-100 rounded">
      <p>
        Note: Some links on this page are affiliate links. We may receive a commission
        if you make a purchase after clicking these links. This helps support our
        service and allows us to continue providing free price comparisons.
      </p>
    </div>
  );
};

export default AffiliateLink;