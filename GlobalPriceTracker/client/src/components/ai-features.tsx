import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  naturalLanguageSearch, 
  getProductRecommendations, 
  getPriceInsights,
  compareProducts
} from '@/lib/ai';
import { Loader2, Search, TrendingUp, Sparkles, BarChart } from 'lucide-react';

export default function AIFeatures() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [recommendationCategory, setRecommendationCategory] = useState('Electronics');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const [productId, setProductId] = useState<string>('');
  const [priceInsights, setPriceInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const [product1Id, setProduct1Id] = useState<string>('');
  const [product2Id, setProduct2Id] = useState<string>('');
  const [comparison, setComparison] = useState<any>(null);
  const [isComparingProducts, setIsComparingProducts] = useState(false);

  // Natural language search 
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query is required",
        description: "Please enter a search term to continue",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const result = await naturalLanguageSearch(searchQuery);
      if (result.error) {
        throw new Error(result.error);
      }
      setSearchResults(result.results || []);
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // AI product recommendations
  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const result = await getProductRecommendations(undefined, undefined, recommendationCategory);
      setRecommendations(result.recommendations || []);
    } catch (error) {
      toast({
        title: "Failed to get recommendations",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Price trend insights
  const handleGetPriceInsights = async () => {
    if (!productId.trim() || isNaN(parseInt(productId))) {
      toast({
        title: "Valid product ID is required",
        description: "Please enter a numeric product ID",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingInsights(true);
    try {
      const result = await getPriceInsights(parseInt(productId));
      if (result.error) {
        throw new Error(result.error);
      }
      setPriceInsights(result.insights || null);
    } catch (error) {
      toast({
        title: "Failed to get price insights",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setPriceInsights(null);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // AI product comparison
  const handleCompareProducts = async () => {
    if (!product1Id.trim() || isNaN(parseInt(product1Id)) || !product2Id.trim() || isNaN(parseInt(product2Id))) {
      toast({
        title: "Valid product IDs are required",
        description: "Please enter numeric product IDs for both products",
        variant: "destructive"
      });
      return;
    }
    
    setIsComparingProducts(true);
    try {
      const result = await compareProducts(parseInt(product1Id), parseInt(product2Id));
      if (result.error) {
        throw new Error(result.error);
      }
      setComparison(result.comparison || null);
    } catch (error) {
      toast({
        title: "Failed to compare products",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setComparison(null);
    } finally {
      setIsComparingProducts(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Shopping Assistant</h1>
      
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="search">Smart Search</TabsTrigger>
          <TabsTrigger value="recommendations">Product Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Price Insights</TabsTrigger>
          <TabsTrigger value="comparison">Product Comparison</TabsTrigger>
        </TabsList>
        
        {/* Natural Language Search */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} /> Smart Natural Language Search
              </CardTitle>
              <CardDescription>
                Search for products using natural language. Try queries like "affordable laptops for students" or "organic foods on sale".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Input
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>Search</>
                  )}
                </Button>
              </div>
              
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((product, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400">No image</div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                          <div className="text-sm text-gray-500 mb-2">
                            {product.brand ? `Brand: ${product.brand}` : 'Unknown brand'}
                          </div>
                          <p className="text-sm line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {isSearching ? 'Searching...' : 'No results yet. Try a search!'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Recommendations */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} /> AI Product Recommendations
              </CardTitle>
              <CardDescription>
                Get personalized product recommendations based on your interests and shopping history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    className="w-full border rounded-md p-2"
                    value={recommendationCategory}
                    onChange={(e) => setRecommendationCategory(e.target.value)}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Food">Food & Grocery</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home & Garden</option>
                  </select>
                </div>
                <div className="pt-6">
                  <Button onClick={handleGetRecommendations} disabled={isLoadingRecommendations}>
                    {isLoadingRecommendations ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Get Recommendations</>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((product, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400">No image</div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                          {product.reason && (
                            <div className="text-sm text-blue-600 mb-2">
                              Recommended because: {product.reason}
                            </div>
                          )}
                          <p className="text-sm line-clamp-2">
                            {product.description || 'No description available'}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {isLoadingRecommendations ? 'Loading recommendations...' : 'No recommendations yet. Try a category!'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Price Insights */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} /> AI Price Trend Insights
              </CardTitle>
              <CardDescription>
                Get intelligent price analysis for products to find the best time to buy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Input
                  placeholder="Enter product ID"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetPriceInsights()}
                  className="flex-1"
                  type="number"
                />
                <Button onClick={handleGetPriceInsights} disabled={isLoadingInsights}>
                  {isLoadingInsights ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Get Price Insights</>
                  )}
                </Button>
              </div>
              
              {priceInsights ? (
                <Card className="bg-white shadow">
                  <CardHeader>
                    <CardTitle>Price Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-1">Summary</h3>
                        <p>{priceInsights.summary || 'No summary available'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-1">Price Range</h3>
                          <p className="text-sm">
                            {priceInsights.priceRange || 'No data available'}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Price Trend</h3>
                          <p className="text-sm">
                            {priceInsights.trend || 'No data available'}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Best Time to Buy</h3>
                          <p className="text-sm">
                            {priceInsights.bestTimeToBuy || 'No data available'}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Prediction</h3>
                          <p className="text-sm">
                            {priceInsights.prediction || 'No data available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {isLoadingInsights ? 'Analyzing price trends...' : 'Enter a product ID to see price insights'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Product Comparison */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart size={20} /> AI Product Comparison
              </CardTitle>
              <CardDescription>
                Compare two products to find which one offers better value for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Product 1 ID</label>
                  <Input
                    value={product1Id}
                    onChange={(e) => setProduct1Id(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Product 2 ID</label>
                  <Input
                    value={product2Id}
                    onChange={(e) => setProduct2Id(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="pt-6">
                  <Button onClick={handleCompareProducts} disabled={isComparingProducts}>
                    {isComparingProducts ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>Compare</>
                    )}
                  </Button>
                </div>
              </div>
              
              {comparison ? (
                <Card className="bg-white shadow">
                  <CardHeader>
                    <CardTitle>Comparison Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-1">Summary</h3>
                        <p>{comparison.summary || 'No summary available'}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Similarities</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {comparison.similarities ? (
                            comparison.similarities.map((similarity: string, index: number) => (
                              <li key={index} className="text-sm">{similarity}</li>
                            ))
                          ) : (
                            <li className="text-sm">No similarities found</li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">Differences</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {comparison.differences ? (
                            comparison.differences.map((difference: string, index: number) => (
                              <li key={index} className="text-sm">{difference}</li>
                            ))
                          ) : (
                            <li className="text-sm">No differences found</li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-1">Value Comparison</h3>
                        <p className="text-sm">
                          {comparison.valueComparison || 'No value comparison available'}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-1">Recommendation</h3>
                        <p className="font-medium text-blue-600">
                          {comparison.recommendation || 'No recommendation available'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {isComparingProducts ? 'Comparing products...' : 'Enter two product IDs to see a comparison'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}