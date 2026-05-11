import { useState } from 'react';
import { Search, ShoppingCart, Globe, Tag, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/mock-pricing';

interface MarketplaceProductResult {
  id: string;
  name: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  marketplace: string;
  rating?: number;
  reviews?: number;
  shipping?: number;
  freeShipping?: boolean;
}

export function MarketplaceComparison() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MarketplaceProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/marketplace/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Failed to search marketplaces');
        }
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error searching marketplaces:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Example marketplaces for the UI (these would come from an API in production)
  const marketplaces = [
    { id: 'amazon', name: 'Amazon', logo: '/assets/marketplace-logos/amazon.svg', country: 'Global', countryCode: 'us' },
    { id: 'ebay', name: 'eBay', logo: '/assets/marketplace-logos/ebay.svg', country: 'Global', countryCode: 'us' },
    { id: 'aliexpress', name: 'AliExpress', logo: '/assets/marketplace-logos/aliexpress.svg', country: 'China', countryCode: 'cn' },
    { id: 'jumia', name: 'Jumia', logo: '/assets/marketplace-logos/jumia.svg', country: 'Africa', countryCode: 'ke' },
    { id: 'kilimall', name: 'Kilimall', logo: '/assets/marketplace-logos/kilimall.svg', country: 'Kenya', countryCode: 'ke' },
  ];
  
  // Map to get country info for each marketplace
  const marketplaceCountryMap: Record<string, { country: string, countryCode: string }> = {
    'amazon': { country: 'United States', countryCode: 'us' },
    'ebay': { country: 'United States', countryCode: 'us' },
    'aliexpress': { country: 'China', countryCode: 'cn' },
    'jumia': { country: 'Kenya', countryCode: 'ke' },
    'kilimall': { country: 'Kenya', countryCode: 'ke' }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                console.log("Search query updated:", e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              placeholder="Search for products across all marketplaces"
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
            Compare Prices
          </button>
        </div>
      </form>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Marketplaces Included</h3>
        <div className="flex flex-wrap gap-4">
          {marketplaces.map((marketplace) => (
            <div key={marketplace.id} className="flex items-center bg-gray-50 px-4 py-2 rounded-md">
              <img
                src={marketplace.logo}
                alt={`${marketplace.name} logo`}
                className="h-6 w-6 mr-2"
              />
              <div className="flex flex-col">
                <span>{marketplace.name}</span>
                <span className="text-xs text-gray-500 flex items-center">
                  <img 
                    src={`/assets/flags/${marketplace.countryCode}.svg`} 
                    alt={marketplace.country}
                    className="w-3 h-3 mr-1" 
                  />
                  {marketplace.country}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSearching && searchResults && searchResults.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <img 
                      src={`/assets/marketplace-logos/${product.marketplace.toLowerCase()}.svg`}
                      alt={product.marketplace}
                      className="h-5 w-5 mr-2"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{product.marketplace}</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <img 
                          src={`/assets/flags/${marketplaceCountryMap[product.marketplace.toLowerCase()]?.countryCode || 'us'}.svg`}
                          alt={marketplaceCountryMap[product.marketplace.toLowerCase()]?.country || 'United States'}
                          className="w-3 h-3 mr-1"
                        />
                        {marketplaceCountryMap[product.marketplace.toLowerCase()]?.country || 'United States'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2 line-clamp-2 h-12">{product.name}</h4>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      <div className="text-xs text-gray-500">{product.currency}</div>
                    </div>
                    {product.rating && (
                      <div className="flex items-center">
                        <span className="text-amber-500">★</span>
                        <span className="text-sm ml-1">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {product.freeShipping && (
                      <div className="text-sm text-green-600 flex items-center">
                        <Tag size={14} className="mr-1" />
                        Free Shipping
                      </div>
                    )}
                    {product.shipping !== undefined && !product.freeShipping && (
                      <div className="text-sm text-gray-600">
                        Shipping: {formatPrice(product.shipping, product.currency)}
                      </div>
                    )}
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      View on {product.marketplace}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isSearching && searchQuery.trim() ? (
        <div className="text-center py-8">
          <Globe className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-gray-600">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : null}
      
      {!isSearching && (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">Search Across Global Marketplaces</h3>
          <p className="text-gray-600 mb-4">
            Enter a product name above to compare prices across multiple online marketplaces
          </p>
          <ul className="flex flex-wrap justify-center gap-2 max-w-md mx-auto mb-4">
            <li className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Electronics</li>
            <li className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Fashion</li>
            <li className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Home & Garden</li>
            <li className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Sports</li>
            <li className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Beauty</li>
          </ul>
          <p className="text-sm text-gray-500">
            Popular searches: iPhone, Laptop, Running Shoes, Coffee Maker
          </p>
        </div>
      )}
    </div>
  );
}