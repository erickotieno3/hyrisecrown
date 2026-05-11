import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StoreWithCountry } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronRight } from "lucide-react";

export default function FeaturedStores() {
  const { t } = useTranslation("home");
  
  const { data: stores, isLoading, error } = useQuery<StoreWithCountry[]>({
    queryKey: ["/api/stores/featured"],
  });
  
  const renderStores = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="flex items-center justify-center">
          <Skeleton className="h-10 w-24" />
        </div>
      ));
    }
    
    if (error) {
      return (
        <div className="col-span-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load stores. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    return stores?.slice(0, 3).map((store) => (
      <Link key={store.id} href={`/store/${store.id}`}>
        <button className="flex items-center justify-center">
          <img src={store.logoUrl} alt={store.name} className="h-8 object-contain" />
        </button>
      </Link>
    ));
  };
  
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[#333333] font-semibold text-xl mb-6">
          Featured Stores
        </h2>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-12">
            {renderStores()}
          </div>
          
          <Link href="/stores">
            <button className="flex items-center text-[#333333]">
              <span className="text-sm">All Stores</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
