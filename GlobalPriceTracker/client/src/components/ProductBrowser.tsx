import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  generateAlphabet, 
  toTitleCase, 
  truncateText, 
  sortProductsByName 
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Types for our products and related data
interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductBrowserProps {
  title?: string;
  showCategories?: boolean;
  enableFiltering?: boolean;
  onProductSelect?: (product: Product) => void;
  categoryId?: number;
  maxProducts?: number;
}

export default function ProductBrowser({
  title = 'Browse Products',
  showCategories = true,
  enableFiltering = true,
  onProductSelect,
  categoryId,
  maxProducts
}: ProductBrowserProps) {
  const { toast } = useToast();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<number | null>(categoryId || null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'az' | 'za'>('az');
  
  // Update active category when categoryId prop changes
  useEffect(() => {
    if (categoryId !== undefined) {
      setActiveCategory(categoryId);
    }
  }, [categoryId]);

  // Generate alphabet for our filter
  const alphabet = generateAlphabet();
  
  // Fetch all products
  const { 
    data: products = [], 
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch categories if needed
  const { 
    data: categories = [], 
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: showCategories
  });
  
  // Filter and process our products based on current state
  const processedProducts = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    // Type the products array properly
    let filteredProducts = [...products] as Product[];
    
    // Apply category filter if active
    if (activeCategory !== null) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === activeCategory
      );
    }
    
    // Apply letter filter if active
    if (selectedLetter) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toUpperCase().startsWith(selectedLetter)
      );
    }
    
    // Apply search term filter if active
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filteredProducts = sortProductsByName(filteredProducts, sortOrder === 'az');
    
    // Apply max limit if specified
    if (maxProducts && filteredProducts.length > maxProducts) {
      filteredProducts = filteredProducts.slice(0, maxProducts);
    }
    
    return filteredProducts;
  }, [products, activeCategory, selectedLetter, searchTerm, sortOrder, maxProducts]);
  
  // Get letter counts for our alphabet filter
  const letterCounts = React.useMemo(() => {
    if (!products || !Array.isArray(products)) return {};
    
    const counts: Record<string, number> = {};
    let filtered = [...products] as Product[];
    
    // Apply category filter to letter counts if active
    if (activeCategory !== null) {
      filtered = filtered.filter(product => product.categoryId === activeCategory);
    }
    
    // Count products for each letter
    alphabet.forEach(letter => {
      counts[letter] = filtered.filter(product => 
        product.name.toUpperCase().startsWith(letter)
      ).length;
    });
    
    return counts;
  }, [products, alphabet, activeCategory]);
  
  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    if (letterCounts[letter] > 0) {
      setSelectedLetter(prevLetter => prevLetter === letter ? null : letter);
      setSearchTerm('');
    }
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      setSelectedLetter(null);
    }
  };
  
  // Handle category selection
  const handleCategoryChange = (id: number | null) => {
    setActiveCategory(id);
    setSelectedLetter(null);
    setSearchTerm('');
  };
  
  // Handle product selection
  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      toast({
        title: `Selected: ${product.name}`,
        description: 'Click "View Details" to see more information',
      });
    }
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedLetter(null);
    setSearchTerm('');
    if (!categoryId) {
      setActiveCategory(null);
    }
  };
  
  // Handle filtering toggle
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'az' ? 'za' : 'az');
  };

  // Error view if products failed to load
  if (productsError) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Failed to load products</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>There was an error loading the product data. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {/* View mode toggle */}
        <div className="flex mt-2 md:mt-0 space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'az' ? (
              <span className="flex items-center">
                A-Z
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </span>
            ) : (
              <span className="flex items-center">
                Z-A
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {enableFiltering && (
        <div className="space-y-4">
          {/* Categories tabs */}
          {showCategories && (
            <div className="overflow-x-auto">
              <Tabs 
                defaultValue={activeCategory?.toString() || 'all'}
                onValueChange={(value) => handleCategoryChange(value === 'all' ? null : Number(value))}
                className="w-full"
              >
                <TabsList className="flex mb-2">
                  <TabsTrigger value="all" className="flex-shrink-0">
                    All Categories
                  </TabsTrigger>
                  {categoriesLoading ? (
                    <div className="px-4 py-2 flex items-center">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : (
                    Array.isArray(categories) && categories.map((category: Category) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id.toString()}
                        className="flex-shrink-0"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))
                  )}
                </TabsList>
              </Tabs>
            </div>
          )}
          
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Clear filters button */}
            {(selectedLetter || searchTerm || (activeCategory !== null && !categoryId)) && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="shrink-0"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Alphabet filter */}
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={letterCounts[letter] === 0}
                  className={`flex flex-col items-center justify-center w-8 h-10 rounded-md transition-colors ${
                    selectedLetter === letter
                      ? 'bg-blue-500 text-white'
                      : letterCounts[letter] > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="font-medium">{letter}</span>
                  {letterCounts[letter] > 0 && (
                    <span className="text-xs font-medium">{letterCounts[letter]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active filters display */}
          {(selectedLetter || searchTerm || activeCategory !== null) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {selectedLetter && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Starting with: {selectedLetter}
                  <button 
                    onClick={() => setSelectedLetter(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Badge>
              )}
              
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Badge>
              )}
              
              {activeCategory !== null && !categoryId && Array.isArray(categories) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Category: {categories.find((c: Category) => c.id === activeCategory)?.name || 'Unknown'}
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Badge>
              )}
              
              <span className="text-sm text-gray-500 ml-2">
                {processedProducts.length} product{processedProducts.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Product display */}
      {productsLoading ? (
        // Loading skeleton
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {[...Array(4)].map((_, i) => (
            <Card key={i} className={viewMode === 'grid' ? '' : 'overflow-hidden'}>
              {viewMode === 'grid' ? (
                <>
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </>
              ) : (
                <div className="flex p-4">
                  <Skeleton className="h-24 w-24 rounded-md shrink-0" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : processedProducts.length > 0 ? (
        // Product grid/list
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
          {processedProducts.map((product: Product) => (
            <Card 
              key={product.id} 
              className={`overflow-hidden ${viewMode === 'grid' ? '' : 'flex'} transition-transform hover:shadow-md cursor-pointer`}
              onClick={() => handleProductClick(product)}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="secondary">View Details</Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <>
                  <div className="h-24 w-24 bg-gray-100 overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-lg text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm flex-1">{truncateText(product.description, 100)}</p>
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="secondary">View Details</Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        // No products found
        <div className="p-8 text-center bg-gray-50 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No products found</h3>
          <p className="text-gray-600 mb-4">
            {selectedLetter
              ? `No products starting with '${selectedLetter}'`
              : searchTerm
              ? `No products matching '${searchTerm}'`
              : 'Try adjusting your filters or search terms'}
          </p>
          <Button onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
}