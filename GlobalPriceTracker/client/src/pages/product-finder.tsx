import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import ProductBrowser from '@/components/ProductBrowser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  imageUrl: string;
}

export default function ProductFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch countries
  const { data: countries } = useQuery({
    queryKey: ['/api/countries/active'],
  });
  
  // Handle product selection for comparison
  const handleProductSelect = (product: Product) => {
    // Check if product is already in compare list
    if (!compareList.some(p => p.id === product.id)) {
      // Only allow up to 4 products for comparison
      if (compareList.length < 4) {
        setCompareList([...compareList, product]);
      } else {
        // Here you would show a toast notification or some feedback
        alert('You can compare up to 4 products at a time');
      }
    }
  };
  
  // Remove product from compare list
  const removeFromCompare = (productId: number) => {
    setCompareList(compareList.filter(p => p.id !== productId));
  };
  
  // Start comparison
  const startComparison = () => {
    if (compareList.length > 1) {
      // Here you would typically navigate to a comparison page
      // For now, we'll just log the products
      console.log('Comparing products:', compareList);
    }
  };
  
  // Process for filtered products based on search and country
  const { data: filteredProducts } = useQuery({
    queryKey: ['/api/products/search', searchTerm],
    enabled: searchTerm.length > 2,
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Product Finder</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find and compare products across multiple stores and countries
          </p>
        </div>
        
        <Tabs 
          defaultValue="browse" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="text-lg py-3">
              Browse Products
            </TabsTrigger>
            <TabsTrigger value="search" className="text-lg py-3">
              Advanced Search
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              className="text-lg py-3"
              disabled={compareList.length === 0}
            >
              Compare ({compareList.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <Label htmlFor="categoryFilter">Filter by Category</Label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger id="categoryFilter">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.isArray(categories) && categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-1/3">
                  <Label htmlFor="countryFilter">Filter by Country</Label>
                  <Select 
                    value={selectedCountry} 
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger id="countryFilter">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {Array.isArray(countries) && countries.map((country: any) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-1/3">
                  <Label htmlFor="searchInput">Quick Search</Label>
                  <Input
                    id="searchInput"
                    type="text"
                    placeholder="Type to search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ProductBrowser 
                title="Browse All Products"
                showCategories={true}
                enableFiltering={true}
                onProductSelect={handleProductSelect}
                categoryId={selectedCategory !== 'all' ? parseInt(selectedCategory) : undefined}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Product Search</CardTitle>
                <CardDescription>Use multiple criteria to find exactly what you're looking for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="advSearchTerm">Product Name or Keywords</Label>
                      <Input
                        id="advSearchTerm"
                        placeholder="Enter product name or keywords"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="advCategory">Category</Label>
                      <Select 
                        value={selectedCategory} 
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger id="advCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Array.isArray(categories) && categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priceMin">Price Range</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="priceMin"
                          type="number" 
                          placeholder="Min"
                          min={0}
                          value={priceRange[0]} 
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        />
                        <span>to</span>
                        <Input 
                          type="number" 
                          placeholder="Max"
                          min={0}
                          value={priceRange[1]} 
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="advCountry">Country</Label>
                      <Select 
                        value={selectedCountry} 
                        onValueChange={setSelectedCountry}
                      >
                        <SelectTrigger id="advCountry">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          {Array.isArray(countries) && countries.map((country: any) => (
                            <SelectItem key={country.id} value={country.id.toString()}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sortOrder">Sort By</Label>
                      <Select defaultValue="nameAsc">
                        <SelectTrigger id="sortOrder">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                          <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                          <SelectItem value="priceAsc">Price (Low to High)</SelectItem>
                          <SelectItem value="priceDesc">Price (High to Low)</SelectItem>
                          <SelectItem value="popular">Popularity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-4">
                      <Button className="w-full">Search Products</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <div className="w-full mt-4">
                  <h3 className="font-medium text-lg mb-4">Search Results</h3>
                  
                  {/* Display search results */}
                  {searchTerm.length > 2 ? (
                    filteredProducts && Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map((product: Product) => (
                          <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleProductSelect(product)}>
                            <div className="h-40 bg-gray-100 overflow-hidden">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-base mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-end">
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductSelect(product);
                                }}
                              >
                                Add to Compare
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No products found matching your criteria</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Enter at least 3 characters to search</p>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Compare Products</CardTitle>
                <CardDescription>
                  {compareList.length > 0 
                    ? `You have selected ${compareList.length} product${compareList.length > 1 ? 's' : ''} to compare` 
                    : 'Add products to compare from the product browser'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {compareList.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {compareList.map(product => (
                        <Card key={product.id} className="relative">
                          <button 
                            className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-200"
                            onClick={() => removeFromCompare(product.id)}
                            aria-label="Remove from comparison"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="h-32 bg-gray-100 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-base mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            {/* Display category badge */}
                            {Array.isArray(categories) && (
                              <Badge className="mt-2" variant="secondary">
                                {categories.find((c: any) => c.id === product.categoryId)?.name || 'Unknown category'}
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button 
                        size="lg" 
                        disabled={compareList.length < 2}
                        onClick={startComparison}
                      >
                        Compare Products
                      </Button>
                      <Button 
                        variant="outline" 
                        className="ml-4"
                        onClick={() => setCompareList([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-gray-500 mt-4">
                      {compareList.length < 2 ? (
                        <p>Please select at least 2 products to compare</p>
                      ) : (
                        <p>Click "Compare Products" to see detailed comparison</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No products selected</h3>
                    <p className="mt-2 text-gray-500">Browse products and click "Add to Compare" to add them here</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('browse')}
                    >
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center space-x-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/alphabetical-search">Alphabetical Search</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}