import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Country } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronRight } from "lucide-react";

export default function CountrySelector() {
  const { t } = useTranslation("home");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  const { data: countries, isLoading, error } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // Set Kenya as default country once data is loaded
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      const kenya = countries.find(country => country.code === "KE");
      if (kenya) {
        setSelectedCountry(kenya);
      } else {
        setSelectedCountry(countries[0]);
      }
    }
  }, [countries, selectedCountry]);
  
  if (!selectedCountry && isLoading) {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-10 w-40 my-2" />
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {selectedCountry && (
          <Link href={`/country/${selectedCountry.code}`} className="flex items-center text-[#333333] font-medium">
            <span>{selectedCountry.name}</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        )}
      </div>
    </section>
  );
}
