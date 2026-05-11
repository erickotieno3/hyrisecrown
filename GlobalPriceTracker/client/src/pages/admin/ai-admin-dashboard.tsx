import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Settings, Shield, AlertTriangle, Bot, Trash, Database, FileText, BarChart4, Award, Image, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

const settingsSchema = z.object({
  defaultModel: z.string(),
  maxTokens: z.number().min(1).max(4096),
  temperature: z.number().min(0).max(1),
  enableMultimodal: z.boolean(),
  enableImageAnalysis: z.boolean(),
  logUserInteractions: z.boolean(),
  customSystemPrompt: z.string().optional(),
  enableContentModeration: z.boolean(),
  userSessionTimeout: z.number().min(1),
  apiRateLimit: z.number().min(1),
});

const legalSchema = z.object({
  termsOfService: z.string().min(10),
  privacyPolicy: z.string().min(10),
  disclaimerText: z.string().min(10),
  copyrightNotice: z.string().min(10),
  attributionRequirements: z.string().min(10),
});

export default function AIAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [usageStats, setUsageStats] = useState({
    totalRequests: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    errorRate: 0,
    costEstimate: 0,
  });
  
  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      defaultModel: 'gpt-4o',
      maxTokens: 1024,
      temperature: 0.7,
      enableMultimodal: true,
      enableImageAnalysis: true,
      logUserInteractions: true,
      customSystemPrompt: 'You are a helpful shopping assistant for the Tesco Price Comparison platform.',
      enableContentModeration: true,
      userSessionTimeout: 60,
      apiRateLimit: 60,
    },
  });
  
  const legalForm = useForm<z.infer<typeof legalSchema>>({
    resolver: zodResolver(legalSchema),
    defaultValues: {
      termsOfService: `TERMS OF SERVICE\n\nLast Updated: May 19, 2025\n\n1. ACCEPTANCE OF TERMS\nBy accessing and using the Tesco Price Comparison Platform ("Service"), you agree to be bound by these Terms of Service.\n\n2. COPYRIGHT AND CONTENT\nAll content comparison data is provided for informational purposes only. Product names, images, and descriptions are owned by their respective brands. We collect and display this information under fair use principles for the purpose of price comparison.\n\n3. LIMITATION OF LIABILITY\nThe Service is provided "as is" without warranties of any kind. We are not responsible for the accuracy of prices or product information.`,
      
      privacyPolicy: `PRIVACY POLICY\n\nLast Updated: May 19, 2025\n\n1. DATA COLLECTION\nWe collect information necessary to provide our price comparison service, including search queries, browsing behavior, and device information.\n\n2. AI PROCESSING\nUser inputs may be processed by our AI systems powered by OpenAI's models. We implement safeguards to protect user privacy during AI processing.\n\n3. DATA SHARING\nWe do not sell your personal information to third parties. Limited data may be shared with service providers who help us operate our platform.`,
      
      disclaimerText: `DISCLAIMER\n\nThe prices, product information, and images displayed on this platform are collected from various sources and may not always be up-to-date or accurate. We make no representations or warranties about the accuracy, completeness, or reliability of any information provided. Users should verify all information before making purchasing decisions.`,
      
      copyrightNotice: `COPYRIGHT NOTICE\n\n© 2025 Hyrise Crown. All rights reserved.\n\nProduct names, logos, brands, and other trademarks featured or referred to within the Tesco Price Comparison Platform are the property of their respective trademark holders. These trademark holders are not affiliated with, nor do they sponsor or endorse, our service.`,
      
      attributionRequirements: `ATTRIBUTION REQUIREMENTS\n\n1. OPENAI MODEL USAGE\nThis service uses OpenAI's models, including GPT-4o. Usage complies with OpenAI's terms of service.\n\n2. PRODUCT INFORMATION\nProduct information and images are displayed for comparative purposes under fair use principles. All product names and registered trademarks belong to their respective owners.\n\n3. PRICE DATA\nPrice data is collected from publicly available sources with proper attribution to the original retailers.`,
    },
  });

  // Mock login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would call your API
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      // });
      // const data = await response.json();
      
      // For demo purposes
      if (loginEmail === 'admin@tesco-compare.com' && loginPassword === 'ZmQ5*T3sc0&HyR!$3^Cr0wn@2025#Admin') {
        // Simulate successful login
        const mockToken = 'mock-admin-token-' + Date.now();
        setAdminToken(mockToken);
        setIsLoggedIn(true);
        
        toast({
          title: "Login Successful",
          description: "Welcome to the Admin Dashboard",
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    setAdminToken('');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };
  
  const onSettingsSubmit = (values: z.infer<typeof settingsSchema>) => {
    console.log('Saving AI settings:', values);
    
    // In a real implementation, this would call your API
    // fetch('/api/admin/ai-settings', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-admin-token': adminToken,
    //   },
    //   body: JSON.stringify(values),
    // })
    
    toast({
      title: "Settings Saved",
      description: "AI settings have been updated successfully",
    });
  };
  
  const onLegalSubmit = (values: z.infer<typeof legalSchema>) => {
    console.log('Saving legal documents:', values);
    
    // In a real implementation, this would call your API
    // fetch('/api/admin/legal-settings', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-admin-token': adminToken,
    //   },
    //   body: JSON.stringify(values),
    // })
    
    toast({
      title: "Legal Documents Updated",
      description: "Legal settings have been saved successfully",
    });
  };
  
  if (!isLoggedIn) {
    return (
      <Container className="py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Please enter your credentials to access the AI Admin Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <Link href="/auto-pilot-dashboard">
              <span className="hover:underline cursor-pointer">
                Return to Admin Dashboard
              </span>
            </Link>
          </CardFooter>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/auto-pilot-dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">AI Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage GPT and GPT-4o integration settings and policies
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
          <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  +0% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tokens Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.totalTokensUsed}</div>
                <p className="text-xs text-muted-foreground">
                  +0% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.averageResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  +0% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimated Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${usageStats.costEstimate}</div>
                <p className="text-xs text-muted-foreground">
                  +0% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>AI Activity Overview</CardTitle>
                <CardDescription>
                  Monitor usage patterns and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart4 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Usage data will appear here as users interact with AI features</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure AI Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('legal')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Update Legal Documents
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('monitoring')}>
                  <Database className="mr-2 h-4 w-4" />
                  Monitor Usage
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-orange-600">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh API Keys
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-red-600">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Disable AI Features
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Integration Settings</CardTitle>
              <CardDescription>
                Configure OpenAI GPT and GPT-4o behavior and usage limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="defaultModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default AI Model</FormLabel>
                            <div className="relative">
                              <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="gpt-4o">GPT-4o (Latest multimodal model)</option>
                                <option value="gpt-4">GPT-4 (High capability model)</option>
                              </select>
                            </div>
                            <FormDescription>
                              GPT-4o is recommended for best performance
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="maxTokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Tokens</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum output tokens per request (1-4096)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Controls randomness (0-1)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="customSystemPrompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom System Prompt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter default system instructions for the AI"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Default instructions for AI behavior
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={settingsForm.control}
                        name="enableMultimodal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Multimodal Features
                              </FormLabel>
                              <FormDescription>
                                Enable image and text processing capabilities
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="enableImageAnalysis"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Visual Search
                              </FormLabel>
                              <FormDescription>
                                Enable visual product search and image analysis
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="logUserInteractions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Usage Logging
                              </FormLabel>
                              <FormDescription>
                                Log user interactions with AI for monitoring and improvement
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="enableContentModeration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Content Moderation
                              </FormLabel>
                              <FormDescription>
                                Enable content filtering and moderation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={settingsForm.control}
                          name="userSessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (min)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={settingsForm.control}
                          name="apiRateLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Rate Limit (req/hr)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents and Compliance</CardTitle>
              <CardDescription>
                Manage terms of service, privacy policy, and copyright notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...legalForm}>
                <form onSubmit={legalForm.handleSubmit(onLegalSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800">Legal Compliance Notice</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Ensure all legal documents comply with relevant laws and regulations, including GDPR, CCPA, and other applicable privacy laws. These documents should be reviewed by legal counsel before publication.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={legalForm.control}
                      name="termsOfService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms of Service</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The terms under which users can access and use the platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={legalForm.control}
                      name="privacyPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Privacy Policy</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How user data is collected, processed, and protected
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={legalForm.control}
                      name="disclaimerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disclaimer</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Limitations of liability and accuracy of information
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={legalForm.control}
                      name="copyrightNotice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Copyright Notice</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Copyright statement and intellectual property rights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={legalForm.control}
                      name="attributionRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attribution Requirements</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Required attributions for third-party content and AI usage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Legal Documents
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Usage Monitoring</CardTitle>
              <CardDescription>
                Monitor usage patterns, costs, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <BarChart4 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Usage Data Available</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Usage statistics will appear here once users begin interacting with AI features on the platform.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Most Common Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No query data available yet</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Token Usage by Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No token usage data available yet</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent AI Interactions</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent interactions to display</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}