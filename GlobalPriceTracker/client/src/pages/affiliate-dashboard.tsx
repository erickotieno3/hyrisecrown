import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, TrendingUp, ShoppingCart, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo affiliate ID - in a real app this would be fetched from user context
const DEMO_AFFILIATE_ID = 'demo-affiliate-1';

const AffiliateDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch affiliate statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/affiliate/stats', DEMO_AFFILIATE_ID],
    queryFn: () => apiRequest('GET', `/api/affiliate/stats/${DEMO_AFFILIATE_ID}`).then(res => res.json())
  });
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Loading affiliate dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>There was a problem loading your affiliate dashboard. Please try again later.</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your affiliate marketing performance and payouts</p>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="links">My Links</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.clicks.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total tracked clicks through your affiliate links
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.conversions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.conversionRate.toFixed(2)}% conversion rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{stats?.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    Total revenue from your referred customers
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{stats?.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground">
                    £{stats?.pendingPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending payout
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Top Performing Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Your best converting products from the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Product</th>
                      <th className="text-right pb-2">Clicks</th>
                      <th className="text-right pb-2">Conversions</th>
                      <th className="text-right pb-2">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.topProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-4">{product.name}</td>
                        <td className="py-4 text-right">{product.clicks}</td>
                        <td className="py-4 text-right">{product.conversions}</td>
                        <td className="py-4 text-right">
                          {((product.conversions / product.clicks) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Affiliate Links</CardTitle>
                <CardDescription>
                  Create and manage your affiliate links to promote products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Share these links to earn commission on sales:</p>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Tesco Store Homepage</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={`https://www.tesco.com?aff=${DEMO_AFFILIATE_ID}`}
                        readOnly
                        className="flex-1 bg-muted p-2 rounded-md text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://www.tesco.com?aff=${DEMO_AFFILIATE_ID}`);
                          toast({ title: "Link copied to clipboard" });
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Walmart Price Comparison</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={`https://hyrisecrown.com/compare/walmart?aff=${DEMO_AFFILIATE_ID}`}
                        readOnly
                        className="flex-1 bg-muted p-2 rounded-md text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://hyrisecrown.com/compare/walmart?aff=${DEMO_AFFILIATE_ID}`);
                          toast({ title: "Link copied to clipboard" });
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Family Essentials Bundle</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={`https://www.tesco.com/groceries/bundle/12345?aff=${DEMO_AFFILIATE_ID}`}
                        readOnly
                        className="flex-1 bg-muted p-2 rounded-md text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://www.tesco.com/groceries/bundle/12345?aff=${DEMO_AFFILIATE_ID}`);
                          toast({ title: "Link copied to clipboard" });
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
                <CardDescription>
                  Your commission earnings and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="border rounded-md p-6 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Month</h3>
                    <p className="text-2xl font-bold">£127.45</p>
                  </div>
                  <div className="border rounded-md p-6 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Previous Month</h3>
                    <p className="text-2xl font-bold">£203.78</p>
                  </div>
                  <div className="border rounded-md p-6 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</h3>
                    <p className="text-2xl font-bold">£453.62</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-4">Recent Payouts</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2">Date</th>
                      <th className="text-left pb-2">Reference</th>
                      <th className="text-right pb-2">Amount</th>
                      <th className="text-right pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4">2025-03-15</td>
                      <td className="py-4">PAY-2025-03-15</td>
                      <td className="py-4 text-right">£122.40</td>
                      <td className="py-4 text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4">2025-02-15</td>
                      <td className="py-4">PAY-2025-02-15</td>
                      <td className="py-4 text-right">£203.78</td>
                      <td className="py-4 text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4">2025-01-15</td>
                      <td className="py-4">PAY-2025-01-15</td>
                      <td className="py-4 text-right">£127.44</td>
                      <td className="py-4 text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Paid</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure how you receive your affiliate commission payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Payment Method</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="bank">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Payment Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 border rounded-md"
                      placeholder="your-payment-email@example.com"
                      defaultValue="affiliate@example.com"
                    />
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">Notification Preferences</label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="notif-sale" className="mr-2" defaultChecked />
                        <label htmlFor="notif-sale">Notify me of new sales</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="notif-payment" className="mr-2" defaultChecked />
                        <label htmlFor="notif-payment">Notify me of payments</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="notif-promo" className="mr-2" defaultChecked />
                        <label htmlFor="notif-promo">Send me promotional opportunities</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button className="px-4 py-2 bg-primary text-white rounded-md">
                      Save Settings
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}

export default AffiliateDashboard;