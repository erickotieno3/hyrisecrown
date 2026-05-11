import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Store, Product, Category } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useMobile } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ChevronLeft, 
  Filter, 
  ArrowUpDown 
} from "lucide-react";

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("store");
  const isMobile = useMobile();
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Fetch store details
  const { 
    data: store, 
    isLoading: storeLoading, 
    error: storeError 
  } = useQuery<Store>({
    queryKey: [`/api/stores/${id}`],
  });
  
  // Fetch categories
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch products for this store (mock API)
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery<Product[]>({
    queryKey: [`/api/stores/${id}/products`, selectedCategory],
    enabled: !!id,
  });
  
  const isLoading = storeLoading || categoriesLoading || productsLoading;
  const error = storeError || categoriesError || productsError;
  
  // Set page title
  useEffect(() => {
    if (store) {
      document.title = `${store.name} Products - Tesco Price Comparison`;
    }
  }, [store]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        <section className="py-8 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-4">
              <Link href="/countries">
                <Button variant="ghost" size="sm" className="text-white hover:text-white/90">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {t("backToStores")}
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex items-center">
                <Skeleton className="h-16 w-16 mr-4" />
                <Skeleton className="h-10 w-48" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load store details. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center">
                <div className="w-16 h-16 mr-4 bg-white rounded p-2">
                  <img 
                    src={store?.logoUrl} 
                    alt={store?.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="font-inter font-bold text-2xl md:text-3xl">
                  {store?.name}
                </h1>
              </div>
            )}
          </div>
        </section>
        
        <section className="py-6 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl">{t("products")}</h2>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {t("filter")}
                </Button>
                
                <Button variant="outline" size="sm" className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {t("sort")}
                </Button>
              </div>
            </div>
            
            {/* Categories filter */}
            {categoriesLoading ? (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {Array(5).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-24 flex-shrink-0" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        
        <section className="py-10 bg-secondary">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <div key={index} className="flex flex-col">
                    <Skeleton className="h-48 w-full mb-3" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load products. Please try again.
                </AlertDescription>
              </Alert>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-2">{product.name}</h3>
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">{product.brand}</span>
                      </div>
                      <Link href={`/compare/${product.id}`}>
                        <Button className="w-full">{t("compare")}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">{t("noProducts")}</p>
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
