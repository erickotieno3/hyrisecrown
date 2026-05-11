import React, { useState, useEffect } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, ShoppingBag, Store, Plus, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ShopifyStore {
  id: number;
  name: string;
  logoUrl: string;
  apiUrl: string;
  countryId: number;
  createdAt: string;
  updatedAt: string;
  type: string;
}

interface ShopifyProduct {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  currency: string;
  storeName: string;
  storeLogoUrl: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
  flagUrl: string;
}

export default function ShopifyIntegration() {
  const { toast } = useToast();
  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    shopDomain: '',
    accessToken: '',
    countryId: '',
    logoUrl: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState('stores');

  // Get Shopify stores
  const { data: stores, isLoading: storesLoading, refetch: refetchStores } = useQuery({
    queryKey: ['/api/shopify/stores'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/shopify/stores');
      return await res.json();
    }
  });

  // Get countries for dropdown
  const { data: countries } = useQuery({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/countries');
      return await res.json();
    }
  });

  // Get Shopify products
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['/api/shopify/products', currentPage],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/shopify/products?page=${currentPage}&limit=10`);
      return await res.json();
    },
    enabled: currentTab === 'products'
  });

  // Mutation for adding a store
  const addStoreMutation = useMutation({
    mutationFn: async (storeData: any) => {
      const res = await apiRequest('POST', '/api/shopify/stores', storeData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Store added',
        description: 'The Shopify store was added successfully.',
      });
      setAddStoreDialogOpen(false);
      setNewStore({
        name: '',
        shopDomain: '',
        accessToken: '',
        countryId: '',
        logoUrl: ''
      });
      refetchStores();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to add store: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation for syncing stores
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/shopify/sync');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sync started',
        description: 'The Shopify sync process has started.',
      });
      // Setup WebSocket connection to get real-time updates
      setupWebSocket();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to start sync: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // WebSocket setup for real-time sync updates
  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      // Request initial Shopify products
      socket.send(JSON.stringify({ 
        type: 'get_shopify_products',
        page: 1,
        limit: 10
      }));
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'shopify_sync_complete') {
        toast({
          title: 'Sync Complete',
          description: `Updated ${data.productsUpdated} products from Shopify.`,
        });
        refetchProducts();
        refetchStores();
      } else if (data.type === 'shopify_products') {
        // Handle incoming product data
        queryClient.setQueryData(['/api/shopify/products', data.page], {
          products: data.products,
          page: data.page,
          limit: data.limit
        });
      } else if (data.type === 'error') {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      socket.close();
    };
  };

  useEffect(() => {
    if (currentTab === 'products') {
      refetchProducts();
    }
  }, [currentPage, currentTab, refetchProducts]);

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    addStoreMutation.mutate(newStore);
  };

  const handleStartSync = () => {
    syncMutation.mutate();
  };

  const handlePaginationChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Shopify Integration</h2>
      
      <Tabs defaultValue="stores" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>
        
        {/* Stores Tab */}
        <TabsContent value="stores">
          <div className="flex justify-between mb-4">
            <Button onClick={handleStartSync} disabled={syncMutation.isPending}>
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync All Stores
                </>
              )}
            </Button>
            
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shopify Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Shopify Store</DialogTitle>
                  <DialogDescription>
                    Enter your Shopify store details to connect to the price comparison platform.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddStore}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Store Name</Label>
                      <Input
                        id="name"
                        value={newStore.name}
                        onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="shopDomain" className="text-right">Shop Domain</Label>
                      <Input
                        id="shopDomain"
                        value={newStore.shopDomain}
                        onChange={(e) => setNewStore({...newStore, shopDomain: e.target.value})}
                        className="col-span-3"
                        placeholder="mystore.myshopify.com"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="accessToken" className="text-right">Access Token</Label>
                      <Input
                        id="accessToken"
                        type="password"
                        value={newStore.accessToken}
                        onChange={(e) => setNewStore({...newStore, accessToken: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="countryId" className="text-right">Country</Label>
                      <Select
                        value={newStore.countryId}
                        onValueChange={(value) => setNewStore({...newStore, countryId: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries?.map((country: Country) => (
                            <SelectItem key={country.id} value={country.id.toString()}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="logoUrl" className="text-right">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={newStore.logoUrl}
                        onChange={(e) => setNewStore({...newStore, logoUrl: e.target.value})}
                        className="col-span-3"
                        placeholder="https://cdn.shopify.com/s/files/1/logo.png"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={addStoreMutation.isPending}>
                      {addStoreMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : 'Add Store'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {storesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store: ShopifyStore) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {store.logoUrl && (
                            <img src={store.logoUrl} alt={store.name} className="w-6 h-6 object-contain" />
                          )}
                          {store.name}
                        </div>
                      </TableCell>
                      <TableCell>{store.apiUrl}</TableCell>
                      <TableCell>
                        {countries?.find((c: Country) => c.id === store.countryId)?.name || store.countryId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(store.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Shopify Stores</CardTitle>
                <CardDescription>
                  You haven't added any Shopify stores yet. Add your first store to start syncing products.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6">
                <Store className="h-16 w-16 text-gray-300" />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => setAddStoreDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Store
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products">
          {productsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products?.products && products.products.length > 0 ? (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Store</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.products.map((product: ShopifyProduct) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-contain" />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.price.toFixed(2)} {product.currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.storeLogoUrl && (
                              <img src={product.storeLogoUrl} alt={product.storeName} className="w-4 h-4 object-contain" />
                            )}
                            {product.storeName}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePaginationChange(currentPage + 1)}
                  disabled={!products.products || products.products.length < 10}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Products Found</CardTitle>
                <CardDescription>
                  No Shopify products have been synced yet. Add a store and sync products to see them here.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6">
                <ShoppingBag className="h-16 w-16 text-gray-300" />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleStartSync} disabled={syncMutation.isPending}>
                  {syncMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Products
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}