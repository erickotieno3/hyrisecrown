import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import AffiliateLink from './AffiliateLink';

interface ProductAffiliateButtonProps {
  storeId: number;
  productId: number;
  storeName: string;
  productName: string;
  price: number;
  currency: string;
  productUrl: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  className?: string;
}

/**
 * ProductAffiliateButton
 * 
 * A call-to-action button that links to a product on a store website,
 * with built-in affiliate tracking capabilities.
 */
const ProductAffiliateButton: React.FC<ProductAffiliateButtonProps> = ({
  storeId,
  productId,
  storeName,
  productName,
  price,
  currency,
  productUrl,
  variant = 'primary',
  className = ''
}) => {
  // Format the price with the appropriate currency symbol
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
  
  // Map our custom variant names to shadcn Button variants
  const buttonVariant = 
    variant === 'primary' ? 'default' :
    variant === 'secondary' ? 'secondary' :
    variant === 'outline' ? 'outline' : 'default';
  
  return (
    <AffiliateLink
      to={productUrl}
      storeId={storeId}
      productId={productId}
      openInNewTab={true}
    >
      <Button 
        variant={buttonVariant} 
        className={`gap-2 ${className}`}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Buy for {formattedPrice} at {storeName}</span>
        <ExternalLink className="h-4 w-4" />
      </Button>
    </AffiliateLink>
  );
};

export default ProductAffiliateButton;