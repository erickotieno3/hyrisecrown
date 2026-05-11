import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Country, Store } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useMobile } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft } from "lucide-react";

export default function CountryPage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation("country");
  const isMobile = useMobile();
  
  // Fetch country details
  const { 
    data: country, 
    isLoading: countryLoading, 
    error: countryError 
  } = useQuery<Country>({
    queryKey: [`/api/countries/${code}`],
  });
  
  // Fetch stores for this country
  const { 
    data: stores, 
    isLoading: storesLoading, 
    error: storesError 
  } = useQuery<Store[]>({
    queryKey: [`/api/countries/${country?.id}/stores`],
    enabled: !!country?.id,
  });
  
  const isLoading = countryLoading || storesLoading;
  const error = countryError || storesError;
  
  // Set page title
  useEffect(() => {
    if (country) {
      document.title = `${country.name} Stores - Tesco Price Comparison`;
    }
  }, [country]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        <section className="py-8 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:text-white/90">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  {t("backToCountries")}
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <Skeleton className="h-10 w-48" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load country details. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-white">
                  <img 
                    src={country?.flagUrl || `https://flagcdn.com/w80/${code}.png`} 
                    alt={country?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="font-inter font-bold text-2xl md:text-3xl">
                  {t("storesIn", { country: country?.name })}
                </h1>
              </div>
            )}
          </div>
        </section>
        
        <section className="py-10 bg-secondary">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load stores. Please try again.
                </AlertDescription>
              </Alert>
            ) : stores && stores.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stores.map((store) => (
                  <Link key={store.id} href={`/store/${store.id}`}>
                    <a className="bg-white rounded-lg shadow hover:shadow-md transition p-6 flex flex-col items-center cursor-pointer">
                      <div className="w-20 h-20 mb-4 flex items-center justify-center">
                        <img src={store.logoUrl} alt={store.name} className="max-w-full max-h-full" />
                      </div>
                      <h3 className="font-medium text-center text-lg">{store.name}</h3>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">{t("noStores")}</p>
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
