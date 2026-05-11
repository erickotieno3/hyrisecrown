import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Country } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CountriesSupport() {
  const { t } = useTranslation("home");
  
  const { 
    data: activeCountries, 
    isLoading: activeLoading, 
    error: activeError 
  } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });
  
  const { 
    data: comingSoonCountries, 
    isLoading: comingSoonLoading, 
    error: comingSoonError 
  } = useQuery<Country[]>({
    queryKey: ["/api/countries/coming-soon"],
  });
  
  const isLoading = activeLoading || comingSoonLoading;
  const error = activeError || comingSoonError;
  
  if (isLoading) {
    return (
      <section className="py-10 bg-secondary">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />
          <div className="flex flex-wrap justify-center gap-4">
            {Array(11).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-10 w-32 rounded-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-10 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-inter font-semibold text-2xl md:text-3xl text-center mb-4">
            {t("countriesSupport")}
          </h2>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load countries data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-10 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="font-inter font-semibold text-2xl md:text-3xl text-center mb-4">
          {t("countriesSupport")}
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          {t("countriesSupportSubtitle")}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {activeCountries?.map((country) => (
            <span key={country.id} className="inline-block bg-white rounded-full py-2 px-4 text-sm shadow">
              {country.name}
            </span>
          ))}
        </div>
        
        {comingSoonCountries && comingSoonCountries.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600 font-medium">{t("comingSoon")}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              {comingSoonCountries.map((country) => (
                <span key={country.id} className="inline-block bg-white bg-opacity-50 rounded-full py-2 px-4 text-sm">
                  {country.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
