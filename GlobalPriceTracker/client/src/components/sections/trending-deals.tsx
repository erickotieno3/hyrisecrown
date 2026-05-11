import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProductWithPrices } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function TrendingDeals() {
  const { t } = useTranslation(["home", "common"]);
  
  const { data: products, isLoading, error } = useQuery<ProductWithPrices[]>({
    queryKey: ["/api/products/trending"],
  });
  
  const renderProducts = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="h-48 w-full mb-3" />
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load trending deals. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return products?.map((product) => {
      // Get the lowest price store for this product
      const bestPrice = product.prices.length > 0 ? 
        product.prices.reduce((prev, current) => (prev.price < current.price) ? prev : current) : 
        null;
      
      // Calculate discount percentage
      const discountPercentage = bestPrice?.discountPercentage || 0;
      
      return (
        <div key={product.id} className="product-card bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
          <div className="relative">
            <div className="h-48 bg-gray-200">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {discountPercentage > 0 && (
              <span className="absolute top-2 right-2 bg-accent text-white text-sm font-medium px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
          </div>
          <div className="p-4">
            {bestPrice && (
              <div className="flex items-center mb-2">
                <img src={bestPrice.store.logoUrl} alt={bestPrice.store.name} className="w-6 h-6 mr-2" />
                <span className="text-sm text-gray-600">{bestPrice.store.name}</span>
              </div>
            )}
            <h3 className="font-medium mb-1 line-clamp-2">{product.name}</h3>
            {bestPrice && (
              <div className="flex items-baseline mb-3">
                <span className="text-lg font-semibold">
                  {bestPrice.currency} {bestPrice.price.toFixed(2)}
                </span>
                {bestPrice.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {bestPrice.currency} {bestPrice.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            )}
            <Link href={`/compare/${product.id}`}>
              <Button className="w-full bg-primary hover:bg-opacity-90 text-white py-2 rounded transition">
                {t("common:compareNow")}
              </Button>
            </Link>
          </div>
        </div>
      );
    });
  };
  
  return (
    <section className="py-10 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-inter font-semibold text-2xl md:text-3xl">
            {t("common:trendingDeals")}
          </h2>
          <Link href="/trending" className="text-primary hover:underline">
            {t("common:viewAll")}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderProducts()}
        </div>
      </div>
    </section>
  );
}
