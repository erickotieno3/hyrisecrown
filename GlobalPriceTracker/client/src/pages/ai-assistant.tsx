import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import AIFeatures from "@/components/ai-features";
import { getShoppingGuide } from "@/lib/ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShoppingBag, Lightbulb, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIAssistantPage() {
  const [shoppingGuide, setShoppingGuide] = useState<any>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>({
    categories: ["Electronics", "Food & Grocery"],
    priceRange: "mid-range",
    brands: ["Tesco", "Samsung", "Apple"]
  });

  // Fetch shopping guide for a demo user
  useEffect(() => {
    const fetchShoppingGuide = async () => {
      setIsLoadingGuide(true);
      try {
        // Using a dummy user ID for demo purposes
        const result = await getShoppingGuide("demo-user-123");
        setShoppingGuide(result);
      } catch (error) {
        console.error("Failed to fetch shopping guide:", error);
      } finally {
        setIsLoadingGuide(false);
      }
    };

    fetchShoppingGuide();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>AI Shopping Assistant | Tesco Price Comparison</title>
        <meta name="description" content="Get personalized product recommendations, smart price insights, and AI-powered shopping assistance" />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 flex items-center justify-center gap-2">
            <Bot className="h-8 w-8" />
            AI Shopping Assistant
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Your intelligent companion for smarter shopping decisions
          </p>
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="features">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Features
            </TabsTrigger>
            <TabsTrigger value="guide">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shopping Guide
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="w-4 h-4 mr-2" />
              Smart Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <AIFeatures />
          </TabsContent>

          <TabsContent value="guide">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Personalized Shopping Guide
                </CardTitle>
                <CardDescription>
                  AI-generated shopping recommendations based on your preferences and market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingGuide ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Generating your personalized shopping guide...</p>
                  </div>
                ) : shoppingGuide ? (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-lg mb-2">Your Shopping Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Favorite Categories</h4>
                          <ul className="mt-1">
                            {userPreferences.categories.map((category: string, index: number) => (
                              <li key={index} className="text-sm">{category}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Price Range</h4>
                          <p className="text-sm mt-1 capitalize">{userPreferences.priceRange}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Preferred Brands</h4>
                          <ul className="mt-1">
                            {userPreferences.brands.map((brand: string, index: number) => (
                              <li key={index} className="text-sm">{brand}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Recommended Shopping Plan</h3>
                      <div className="space-y-4">
                        {shoppingGuide?.recommendations ? (
                          shoppingGuide.recommendations.map((item: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-medium">{item.title || `Recommendation ${index + 1}`}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              {item.stores && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium text-gray-500">Recommended Stores:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.stores.map((store: string, idx: number) => (
                                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {store}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No recommendations available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Budget Optimization Tips</h3>
                      <ul className="space-y-2">
                        {shoppingGuide?.tips ? (
                          shoppingGuide.tips.map((tip: string, index: number) => (
                            <li key={index} className="text-sm flex items-start">
                              <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              {tip}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">No shopping tips available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="mb-4">We need to learn more about your preferences to create a personalized shopping guide.</p>
                    <Button>Set Up Shopping Preferences</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Smart Shopping Insights
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of market trends and shopping patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Market Trends</h3>
                    <p className="text-sm">
                      Our AI analysis shows price drops expected in electronics in the next 2 weeks. 
                      Consider delaying large purchases in this category if possible.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Best Days to Shop</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Groceries</h4>
                        <p className="text-sm mt-1">Tuesday and Wednesday mornings show 12% lower average prices</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Electronics</h4>
                        <p className="text-sm mt-1">Monday evenings and Thursday afternoons for best deals</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Clothing</h4>
                        <p className="text-sm mt-1">End-of-month sales offer average 22% discounts</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Home Goods</h4>
                        <p className="text-sm mt-1">Weekend flash sales provide best value (15-30% off)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Price Alert Suggestions</h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm">
                        Based on your browsing history, we recommend setting price alerts for these items 
                        that are likely to go on sale soon:
                      </p>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm flex items-center">
                          <span className="h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                          Samsung Galaxy tablets (expected 15-20% drop)
                        </li>
                        <li className="text-sm flex items-center">
                          <span className="h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                          Kitchen appliances (seasonal sales approaching)
                        </li>
                        <li className="text-sm flex items-center">
                          <span className="h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                          Winter clothing (end-of-season clearance expected)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}