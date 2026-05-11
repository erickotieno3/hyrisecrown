import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductPrice, Store } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, X } from "lucide-react";
import { getPriceInStoreCurrency, formatPrice as formatCurrencyPrice } from "@/lib/mock-pricing";

// Example product ID (Rice)
const EXAMPLE_PRODUCT_ID = 5;

export default function ProductComparison() {
  const { t } = useTranslation(["compare", "common"]);
  
  // Get the product details
  const { 
    data: product, 
    isLoading: productLoading,
    error: productError
  } = useQuery<Product>({
    queryKey: [`/api/products/${EXAMPLE_PRODUCT_ID}`],
  });
  
  // Get the comparison data
  const { 
    data: priceComparison, 
    isLoading: comparisonLoading,
    error: comparisonError
  } = useQuery<(ProductPrice & { store: Store })[]>({
    queryKey: [`/api/products/${EXAMPLE_PRODUCT_ID}/compare`],
  });
  
  const isLoading = productLoading || comparisonLoading;
  const error = productError || comparisonError;
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const dateObj = new Date(date);
    
    // Calculate the difference in days
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t("today");
    } else if (diffDays === 1) {
      return t("yesterday");
    } else {
      return t("daysAgo", { days: diffDays });
    }
  };
  
  // Function to format price with currency symbol
  const formatPrice = (price: number, currency: string) => {
    return formatCurrencyPrice(price, currency);
  };
  
  // Helper function to get country code from store
  const getCountryCode = (store: Store) => {
    // If store has countryCode property, use it
    if ('countryCode' in store) {
      return (store as any).countryCode.toLowerCase();
    }
    
    // Otherwise determine based on store name
    const storeCountryMap: Record<string, string> = {
      'Tesco': 'gb',
      'Carrefour': 'fr',
      'Naivas': 'ke',
      'Shoprite': 'za',
      'Aldi': 'de',
      'Lidl': 'de',
      'Walmart': 'us',
      'Kroger': 'us',
      'Coles': 'au',
      'Loblaws': 'ca'
    };
    
    return storeCountryMap[store.name] || 'us';
  };
  
  // Helper function to get country name from store
  const getCountryName = (store: Store) => {
    // If store has country property, use it
    if ('country' in store) {
      return (store as any).country;
    }
    
    // Otherwise determine based on store name
    const storeCountryMap: Record<string, string> = {
      'Tesco': 'United Kingdom',
      'Carrefour': 'France',
      'Naivas': 'Kenya',
      'Shoprite': 'South Africa',
      'Aldi': 'Germany',
      'Lidl': 'Germany',
      'Walmart': 'United States',
      'Kroger': 'United States',
      'Coles': 'Australia',
      'Loblaws': 'Canada'
    };
    
    return storeCountryMap[store.name] || 'United States';
  };
  
  if (isLoading) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-60 mx-auto mb-8" />
          <div className="bg-secondary rounded-lg shadow-md overflow-hidden p-4 lg:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
              <div className="md:w-1/4">
                <Skeleton className="h-60 w-full" />
              </div>
              <div className="md:w-3/4">
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-inter font-semibold text-2xl md:text-3xl text-center mb-8">
            {t("priceComparison")}
          </h2>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load comparison data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-inter font-semibold text-2xl md:text-3xl text-center mb-8">
          {t("priceComparison")}
        </h2>
        
        <div className="bg-secondary rounded-lg shadow-md overflow-hidden p-4 lg:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                <div className="h-48 bg-gray-200 mb-4 rounded-md overflow-hidden">
                  <img src={product?.imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-lg mb-2">{product?.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product?.description}</p>
              </div>
            </div>
            
            <div className="md:w-3/4">
              <h4 className="font-medium text-lg mb-4">{t("priceComparison")}</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left border border-gray-300">{t("store")}</th>
                      <th className="py-2 px-4 text-left border border-gray-300">{t("price")}</th>
                      <th className="py-2 px-4 text-left border border-gray-300">{t("availability")}</th>
                      <th className="py-2 px-4 text-left border border-gray-300">{t("lastUpdated")}</th>
                      <th className="py-2 px-4 text-left border border-gray-300">{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceComparison?.map((item, index) => (
                      <tr key={item.storeId} className={index === 0 ? "bg-success bg-opacity-10" : ""}>
                        <td className="py-3 px-4 border border-gray-300">
                          <div className="flex items-center">
                            <img src={item.store.logoUrl} alt={item.store.name} className="w-6 h-6 mr-2" />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.store.name}</span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <img 
                                  src={`/assets/flags/${getCountryCode(item.store)}.svg`} 
                                  alt={getCountryName(item.store)} 
                                  className="w-3 h-3 mr-1" 
                                />
                                {getCountryName(item.store)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 border border-gray-300 font-semibold">
                          <div className="flex flex-col">
                            <span className="text-primary">{formatPrice(item.price, item.currency)}</span>
                            <span className="text-xs text-gray-500">{item.currency}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 border border-gray-300">
                          {item.inStock ? (
                            <span className="text-success flex items-center">
                              <Check className="h-4 w-4 mr-1" /> In Stock
                            </span>
                          ) : (
                            <span className="text-error flex items-center">
                              <X className="h-4 w-4 mr-1" /> Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 border border-gray-300">
                          {formatDate(new Date(item.lastUpdated))}
                        </td>
                        <td className="py-3 px-4 border border-gray-300">
                          <Button variant="link" className="text-primary hover:underline p-0 h-auto">
                            {t("viewDeal")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-500">
                  {t("pricesUpdatedRealtime", { time: new Date().toLocaleTimeString() })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
