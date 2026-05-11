import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function SearchBar() {
  const { t } = useTranslation("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="w-full border border-gray-300 rounded-l-lg py-6 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-0 top-0 h-full flex items-center mr-4 text-gray-400">
                <Filter className="h-5 w-5" />
              </div>
            </div>
            <Button 
              type="submit"
              className="bg-primary hover:bg-opacity-90 text-white py-3 px-6 rounded-r-lg transition"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
