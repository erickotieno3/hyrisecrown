import React, { useState } from 'react';
import { ProductScanner, IdentifiedProduct, SimilarProduct } from '@/components/visual-search/product-scanner';
import { SearchResults } from '@/components/visual-search/search-results';
import { Container } from '@/components/ui/container';
import { Scan, Sparkles } from 'lucide-react';

export default function VisualSearchPage() {
  const [searchState, setSearchState] = useState<'scanning' | 'results'>('scanning');
  const [identifiedProduct, setIdentifiedProduct] = useState<IdentifiedProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);

  const handleResultsFound = (product: IdentifiedProduct, similar: SimilarProduct[]) => {
    setIdentifiedProduct(product);
    setSimilarProducts(similar);
    setSearchState('results');
  };

  const handleReset = () => {
    setSearchState('scanning');
    setIdentifiedProduct(null);
    setSimilarProducts([]);
  };

  return (
    <Container className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center mb-2">
          <Scan className="h-8 w-8 mr-2 text-primary" />
          Find Products with AI
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take a photo or upload an image of any product to find it across stores and get the best prices. 
          Our AI will identify the product and show you similar options from different retailers.
        </p>
        
        <div className="flex items-center justify-center mt-4">
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by advanced AI image recognition
          </span>
        </div>
      </div>

      {searchState === 'scanning' ? (
        <ProductScanner onResultsFound={handleResultsFound} />
      ) : (
        identifiedProduct && (
          <SearchResults 
            identifiedProduct={identifiedProduct}
            similarProducts={similarProducts}
            onReset={handleReset}
          />
        )
      )}
    </Container>
  );
}