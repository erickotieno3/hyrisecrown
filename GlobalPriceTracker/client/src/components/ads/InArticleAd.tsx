import React from 'react';
import AdUnit from './AdUnit';
import { AdPosition, AdFormat } from '@/lib/adsense';

interface InArticleAdProps {
  className?: string;
}

/**
 * In-Article Advertisement Component
 * 
 * This component displays an in-article advertisement
 * typically used within content blocks or product descriptions.
 */
export function InArticleAd({ className }: InArticleAdProps) {
  return (
    <div className={`w-full my-6 ${className || ''}`}>
      <AdUnit 
        position={AdPosition.IN_CONTENT} 
        format={AdFormat.IN_ARTICLE}
        style={{ 
          minHeight: '250px',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem'
        }} 
      />
    </div>
  );
}

export default InArticleAd;