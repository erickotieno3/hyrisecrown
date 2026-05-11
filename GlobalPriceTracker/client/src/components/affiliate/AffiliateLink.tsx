import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { ExternalLink } from 'lucide-react';

interface AffiliateLinkProps {
  to: string;
  storeId: number;
  productId?: number;
  className?: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
}

/**
 * AffiliateLink Component
 * 
 * Wraps links with affiliate tracking capabilities. When clicked, it:
 * 1. Records the click in the affiliate system
 * 2. Attributes the click to the current affiliate (if any)
 * 3. Redirects to the appropriate destination
 * 
 * @example
 * <AffiliateLink to="https://tesco.com/product/12345" storeId={1} productId={12345}>
 *   View at Tesco
 * </AffiliateLink>
 */
const AffiliateLink: React.FC<AffiliateLinkProps> = ({
  to,
  storeId,
  productId,
  className = '',
  openInNewTab = true,
  children
}) => {
  // Check if URL is external
  const isExternal = to.startsWith('http');
  
  // Get affiliate ID from localStorage or use demo ID
  const affiliateId = localStorage.getItem('affiliateId') || 'demo-affiliate-1';
  
  const handleClick = async (e: React.MouseEvent) => {
    if (isExternal) {
      e.preventDefault();
      
      try {
        // Record affiliate click
        const clickData = {
          affiliateId,
          storeId,
          productId,
          referrer: window.location.href,
          userAgent: navigator.userAgent,
          ipHash: 'anonymized', // In a real app, this would be handled server-side
        };
        
        const response = await apiRequest('POST', '/api/affiliate/click', clickData);
        const result = await response.json();
        
        // Redirect to destination URL
        if (result.success) {
          // In a real system, might use the redirectUrl from the response
          // or append tracking parameters to the destination URL
          window.open(to, openInNewTab ? '_blank' : '_self');
        } else {
          console.error('Failed to record affiliate click');
          window.open(to, openInNewTab ? '_blank' : '_self');
        }
      } catch (error) {
        console.error('Error recording affiliate click', error);
        // Still redirect even if tracking fails
        window.open(to, openInNewTab ? '_blank' : '_self');
      }
    }
  };
  
  // For external links, use anchor tags with tracking
  if (isExternal) {
    return (
      <a 
        href={to}
        className={className}
        onClick={handleClick}
        rel="noopener noreferrer"
        target={openInNewTab ? "_blank" : "_self"}
      >
        {children}
        {openInNewTab && <ExternalLink className="ml-1 h-3 w-3 inline" />}
      </a>
    );
  }
  
  // For internal links, use Wouter's Link component
  return (
    <Link href={to} className={className}>
      {children}
    </Link>
  );
};

export default AffiliateLink;