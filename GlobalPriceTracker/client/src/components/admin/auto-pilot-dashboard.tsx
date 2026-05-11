import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AutoPilotConfig {
  id: number;
  feature: string;
  description: string | null;
  isEnabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

interface AutoPilotLog {
  id: number;
  featureId: number;
  status: string;
  startTime: string;
  endTime: string | null;
  error: string | null;
}

interface OpenAIStatus {
  success: boolean;
  apiKeyConfigured: boolean;
  fallbackMechanismEnabled: boolean;
  message: string;
}

export default function AutoPilotDashboard() {
  const [configs, setConfigs] = useState<AutoPilotConfig[]>([]);
  const [logs, setLogs] = useState<AutoPilotLog[]>([]);
  const [openAIStatus, setOpenAIStatus] = useState<OpenAIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { toast } = useToast();
  
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch auto-pilot configs
      const configsResponse = await fetch('/api/test/auto-pilot-configs');
      const configsData = await configsResponse.json();
      
      if (configsData.success) {
        setConfigs(configsData.configs);
      }
      
      // Fetch OpenAI status
      const openAIResponse = await fetch('/api/test/openai-status');
      const openAIData = await openAIResponse.json();
      
      if (openAIData.success) {
        setOpenAIStatus(openAIData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error fetching data',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const triggerTask = async (feature: string) => {
    try {
      const response = await fetch(`/api/test/auto-blog-trigger`);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Task triggered',
          description: `Auto-blog generation has been manually triggered.`,
        });
        // Refresh data after a short delay to allow task to complete
        setTimeout(fetchData, 3000);
      } else {
        toast({
          title: 'Failed to trigger task',
          description: data.message || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error triggering task:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up interval to refresh data every 60 seconds
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'running': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getFeatureDisplayName = (feature: string) => {
    switch (feature) {
      case 'auto-blog-weekly': return 'Weekly Blog Posts';
      case 'auto-blog-product': return 'Product Blog Posts';
      case 'auto-product-updates': return 'Product Price Updates';
      case 'auto-newsletter': return 'Weekly Newsletter';
      default: return feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Auto-Pilot Dashboard</h2>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="configs">
        <TabsList className="mb-4">
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="openai">OpenAI Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config) => (
              <Card key={config.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">
                      {getFeatureDisplayName(config.feature)}
                    </CardTitle>
                    <Badge variant={config.isEnabled ? 'default' : 'outline'}>
                      {config.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <CardDescription>{config.description || 'No description available'}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last run:</span>
                      <span className="font-medium">{formatDate(config.lastRun)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Next run:</span>
                      <span className="font-medium">{formatDate(config.nextRun)}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  {config.feature === 'auto-blog-weekly' && (
                    <Button 
                      onClick={() => triggerTask(config.feature)} 
                      variant="secondary" 
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2"
                      disabled={refreshing}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Run Manually
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                OpenAI Integration Status
                {openAIStatus?.apiKeyConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <strong>API Key Configured:</strong>
                  {openAIStatus?.apiKeyConfigured ? (
                    <Badge variant="default" className="bg-green-500">Yes</Badge>
                  ) : (
                    <Badge variant="destructive">No</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <strong>Fallback Mechanism:</strong>
                  {openAIStatus?.fallbackMechanismEnabled ? (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </div>
                
                <div>
                  <strong>Status Message:</strong>
                  <p className="mt-1 text-sm border p-2 rounded bg-slate-50">
                    {openAIStatus?.message || 'No status message available'}
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800">
                        <strong>Important:</strong> If the OpenAI API key is not configured or quota is exceeded, 
                        the system will automatically fall back to pre-written content templates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}