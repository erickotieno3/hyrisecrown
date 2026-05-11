import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Store, Tag, BarChart2, ShoppingCart } from 'lucide-react';
import { IdentifiedProduct, SimilarProduct } from './product-scanner';
import { Button } from '@/components/ui/button';

interface SearchResultsProps {
  identifiedProduct: IdentifiedProduct;
  similarProducts: SimilarProduct[];
  onReset: () => void;
}

export function SearchResults({ identifiedProduct, similarProducts, onReset }: SearchResultsProps) {
  // Format confidence as percentage
  const confidencePercent = Math.round(identifiedProduct.confidence * 100);
  
  return (
    <div className="space-y-6">
      {/* Identified Product Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Identified Product
            </span>
            <Badge variant={confidencePercent > 80 ? "default" : "outline"}>
              {confidencePercent}% match
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{identifiedProduct.name}</h3>
              {identifiedProduct.brand && (
                <p className="text-sm text-muted-foreground">Brand: {identifiedProduct.brand}</p>
              )}
              {identifiedProduct.category && (
                <p className="text-sm text-muted-foreground">Category: {identifiedProduct.category}</p>
              )}
            </div>
            
            {Object.keys(identifiedProduct.attributes).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Product Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(identifiedProduct.attributes).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-muted-foreground capitalize">{key}</span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Similar Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <BarChart2 className="mr-2 h-5 w-5" />
            Price Comparison
          </h2>
          
          <Button variant="outline" size="sm" onClick={onReset}>
            New Search
          </Button>
        </div>
        
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex h-full">
                  {/* Product Image */}
                  <div className="w-1/3 bg-gray-100">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="w-2/3 p-4">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        {product.price && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Store className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{product.store || 'Unknown store'}</span>
                            </div>
                            <span className="font-semibold">
                              {product.currency || '$'}{product.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">No similar products found.</p>
          </div>
        )}
      </div>
      
      {/* B2B Insights Link */}
      {identifiedProduct.name !== 'Unknown product' && (
        <div className="mt-4 text-center">
          <Button variant="link" className="text-primary">
            View B2B Market Insights
          </Button>
        </div>
      )}
    </div>
  );
}