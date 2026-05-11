import React from 'react';
import AdUnit from './AdUnit';
import { AdPosition, AdFormat } from '@/lib/adsense';

interface ProductListAdProps {
  className?: string;
  index?: number;
}

/**
 * Product List Advertisement Component
 * 
 * This component displays advertisements between product listings.
 * Can be configured to appear after a specific number of products.
 */
export function ProductListAd({ className, index = 0 }: ProductListAdProps) {
  return (
    <div 
      className={`w-full my-3 p-2 border border-gray-100 rounded-md ${className || ''}`}
      data-ad-index={index}
    >
      <div className="text-xs text-gray-400 mb-1">Sponsored</div>
      <AdUnit 
        position={AdPosition.BETWEEN_PRODUCTS} 
        format={AdFormat.IN_FEED}
        style={{ 
          minHeight: '200px',
          backgroundColor: '#f9fafb'
        }} 
      />
    </div>
  );
}

export default ProductListAd;