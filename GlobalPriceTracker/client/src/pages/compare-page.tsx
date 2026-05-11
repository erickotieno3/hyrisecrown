import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductPrice, Store } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useMobile } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, Check, X } from "lucide-react";

export default function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(["compare", "common"]);
  const isMobile = useMobile();
  
  // Get the product details
  const { 
    data: product, 
    isLoading: productLoading,
    error: productError
  } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });
  
  // Get the comparison data
  const { 
    data: priceComparison, 
    isLoading: comparisonLoading,
    error: comparisonError
  } = useQuery<(ProductPrice & { store: Store })[]>({
    queryKey: [`/api/products/${id}/compare`],
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
  
  // Set page title
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - Price Comparison | Tesco`;
    }
  }, [product]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        <section className="py-8 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-white/90"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("backToProduct")}
              </Button>
            </div>
            
            {isLoading ? (
              <div>
                <Skeleton className="h-10 w-64 bg-white/20" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load product details. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <h1 className="font-inter font-bold text-2xl md:text-3xl">
                {product?.name}
              </h1>
            )}
          </div>
        </section>
        
        <section className="py-10 bg-secondary">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 lg:p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                  <div className="md:w-1/4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                  <div className="md:w-3/4">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load comparison data. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 lg:p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
                  <div className="md:w-1/4">
                    <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                      <div className="h-48 bg-gray-200 mb-4 rounded-md overflow-hidden">
                        <img src={product?.imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-medium text-lg mb-2">{product?.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product?.description}</p>
                      {product?.brand && (
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Brand:</span> {product.brand}
                        </p>
                      )}
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
                                  <span>{item.store.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 border border-gray-300 font-semibold">
                                {item.currency} {item.price.toFixed(2)}
                                {item.originalPrice && (
                                  <span className="ml-2 text-sm text-gray-500 line-through">
                                    {item.currency} {item.originalPrice.toFixed(2)}
                                  </span>
                                )}
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
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      
      {isMobile && <MobileNavigation />}
    </div>
  );
}
