import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Search, RefreshCw } from "lucide-react";
import { Link } from "wouter";

interface SearchResult {
  id: number;
  name: string;
  image: string;
  category: string;
  price?: number;
  currency?: string;
}

export default function SearchPage() {
  const { t } = useTranslation("common");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // In production, this would be a real API call
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      // Generate some demo results
      setSearchResults([
        {
          id: 1,
          name: `${searchQuery} - Sample Product 1`,
          image: "https://via.placeholder.com/200",
          category: "Groceries"
        },
        {
          id: 2,
          name: `${searchQuery} - Sample Product 2`,
          image: "https://via.placeholder.com/200",
          category: "Household"
        },
        {
          id: 3,
          name: `${searchQuery} - Sample Product 3`,
          image: "https://via.placeholder.com/200",
          category: "Electronics"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t("search_products")}</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="animate-spin mr-2" size={20} />
            ) : (
              <Search className="mr-2" size={20} />
            )}
            {t("search")}
          </button>
        </div>
      </form>
      
      <div className="mb-4">
        <Link href="/marketplace-comparison">
          <a className="text-blue-600 hover:underline">
            {t("advanced_search")} - {t("compare_across_marketplaces")}
          </a>
        </Link>
      </div>
      
      {hasSearched && searchResults.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("search_results")} ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((result) => (
              <Link key={result.id} href={`/products/${result.id}`}>
                <a className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <img 
                      src={result.image} 
                      alt={result.name} 
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {result.category}
                    </span>
                    <h3 className="font-medium mt-2 mb-1 line-clamp-2">{result.name}</h3>
                    {result.price && (
                      <p className="font-bold text-blue-600">
                        {result.currency || "$"} {result.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">{t("no_results_found")}</h3>
          <p className="text-gray-600 mb-4">
            {t("try_different_keywords")}
          </p>
        </div>
      ) : (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">{t("search_products")}</h3>
          <p className="text-gray-600 mb-4">
            {t("enter_product_name")}
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-4">
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {t("electronics")}
            </span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {t("groceries")}
            </span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {t("household")}
            </span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {t("clothing")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}