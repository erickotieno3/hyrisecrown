import React, { useState, useEffect } from 'react';
import { 
  FacebookIcon, TwitterIcon, LinkedinIcon, InstagramIcon, 
  Share2Icon, BarChart4Icon, LogInIcon, Users2Icon 
} from 'lucide-react';
import { SiTiktok, SiSnapchat, SiWhatsapp, SiTelegram } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export type SocialPlatform = 
  'facebook' | 'twitter' | 'linkedin' | 'instagram' | 
  'tiktok' | 'snapchat' | 'whatsapp' | 'telegram' | 'google';

interface SocialShareProps {
  productId?: number;
  productName?: string;
  url?: string;
  title?: string;
  description?: string;
}

interface SocialShareLinkObject {
  facebook: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
  email: string;
  [key: string]: string;
}

export const SocialMediaShare: React.FC<SocialShareProps> = ({
  productId,
  productName,
  url,
  title = 'Check out this great deal!',
  description = 'I found a great price comparison on HyriseCrown'
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<SocialShareLinkObject | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { toast } = useToast();
  
  // Set the current URL safely on client-side only
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    // If productId is provided, fetch share links from the API
    if (productId) {
      fetchShareLinks(productId);
    }
  }, [productId]);

  const fetchShareLinks = async (id: number) => {
    try {
      const response = await fetch(`/api/social-media/share-links/${id}`);
      const data = await response.json();
      setShareLinks(data.shareLinks);
    } catch (error) {
      console.error('Error fetching share links:', error);
    }
  };

  const handleShare = async (platform: SocialPlatform) => {
    // If we have pre-generated share links, use them
    if (shareLinks && shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank');
      
      // Record share event
      try {
        await apiRequest('POST', '/api/social-media/share', {
          platform,
          content: customMessage || title,
          productId
        });
      } catch (error) {
        console.error('Error recording share event:', error);
      }
      
      return;
    }

    // Otherwise construct a share URL
    const shareText = encodeURIComponent(customMessage || title);
    const shareUrl = encodeURIComponent(url || currentUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${shareText}%20${shareUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
        break;
      default:
        // For unsupported platforms, show a toast
        toast({
          title: "Sharing not directly supported",
          description: `Direct sharing to ${platform} requires the app. You can copy the link instead.`,
          variant: "default",
        });
        return;
    }
    
    window.open(shareLink, '_blank');
    
    // Record share event in all cases
    try {
      await apiRequest('POST', '/api/social-media/share', {
        platform,
        content: customMessage || title,
        productId
      });
      
      toast({
        title: "Content shared!",
        description: `Successfully shared to ${platform}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error recording share event:', error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url || currentUrl);
    toast({
      title: "Link copied!",
      description: "Link copied to clipboard",
      variant: "default",
    });
  };

  const SocialShareDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {productName || 'this page'}</DialogTitle>
          <DialogDescription>
            Share this {productId ? 'product' : 'page'} across your favorite social platforms
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <Input
              placeholder="Add a custom message (optional)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('facebook')}>
              <FacebookIcon className="h-6 w-6 text-blue-600 mb-1" />
              <span className="text-xs">Facebook</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('twitter')}>
              <TwitterIcon className="h-6 w-6 text-sky-500 mb-1" />
              <span className="text-xs">Twitter</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('linkedin')}>
              <LinkedinIcon className="h-6 w-6 text-blue-700 mb-1" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('whatsapp')}>
              <SiWhatsapp className="h-6 w-6 text-green-500 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('telegram')}>
              <SiTelegram className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-xs">Telegram</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('instagram')}>
              <InstagramIcon className="h-6 w-6 text-pink-600 mb-1" />
              <span className="text-xs">Instagram</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('tiktok')}>
              <SiTiktok className="h-6 w-6 text-black mb-1" />
              <span className="text-xs">TikTok</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center p-3" onClick={() => handleShare('snapchat')}>
              <SiSnapchat className="h-6 w-6 text-yellow-400 mb-1" />
              <span className="text-xs">Snapchat</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input className="flex-1" value={url || currentUrl} readOnly />
            <Button variant="secondary" onClick={handleCopyLink}>Copy</Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
        <Share2Icon className="w-4 h-4 mr-2" />
        <span>Share</span>
      </Button>
      <SocialShareDialog />
    </>
  );
};

interface SocialLoginProps {
  onLogin?: (user: any) => void;
}

export const SocialMediaLogin: React.FC<SocialLoginProps> = ({ onLogin }) => {
  const { toast } = useToast();
  
  const handleSocialLogin = (platform: SocialPlatform) => {
    // Redirect to the appropriate social login endpoint
    window.location.href = `/api/social-media/auth/${platform}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login with Social Media</CardTitle>
        <CardDescription>
          Sign in quickly using your favorite social account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('facebook')}>
            <FacebookIcon className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('google')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
            </svg>
            <span className="text-xs">Google</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('twitter')}>
            <TwitterIcon className="h-6 w-6 text-sky-500 mb-2" />
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('linkedin')}>
            <LinkedinIcon className="h-6 w-6 text-blue-700 mb-2" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('instagram')}>
            <InstagramIcon className="h-6 w-6 text-pink-600 mb-2" />
            <span className="text-xs">Instagram</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('tiktok')}>
            <SiTiktok className="h-6 w-6 text-black mb-2" />
            <span className="text-xs">TikTok</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('snapchat')}>
            <SiSnapchat className="h-6 w-6 text-yellow-400 mb-2" />
            <span className="text-xs">Snapchat</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-4" onClick={() => handleSocialLogin('telegram')}>
            <SiTelegram className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-xs">Telegram</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface SocialFeedsProps {
  maxItems?: number;
}

export const SocialMediaFeeds: React.FC<SocialFeedsProps> = ({ maxItems = 3 }) => {
  const [feeds, setFeeds] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    // Fetch social media feeds from the API
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/social-media/feeds');
        const data = await response.json();
        setFeeds(data.feeds);
      } catch (error) {
        console.error('Error fetching social media feeds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  const renderFeeds = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      );
    }

    if (!feeds) {
      return (
        <div className="text-center p-4 text-gray-500">
          Unable to load social media feeds
        </div>
      );
    }

    // Helper to render feed items based on active tab
    const renderFeedItems = () => {
      let items: any[] = [];

      if (activeTab === 'all') {
        // Combine all feeds
        items = [
          ...(feeds.instagram || []).map((item: any) => ({ ...item, type: 'instagram' })),
          ...(feeds.facebook || []).map((item: any) => ({ ...item, type: 'facebook' })),
          ...(feeds.twitter || []).map((item: any) => ({ ...item, type: 'twitter' }))
        ];
        
        // Sort by date
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        items = (feeds[activeTab] || []).map((item: any) => ({ ...item, type: activeTab }));
      }

      // Limit items
      items = items.slice(0, maxItems);

      if (items.length === 0) {
        return (
          <div className="text-center p-4 text-gray-500">
            No posts available for this platform
          </div>
        );
      }

      return items.map((item: any, index: number) => {
        // Render different card layouts based on the platform
        if (item.type === 'instagram') {
          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <InstagramIcon className="h-4 w-4 text-pink-600 mr-2" />
                    <span className="text-sm font-medium">Instagram</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm">{item.caption}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="mr-4">{item.likes} likes</span>
                  <span>{item.comments} comments</span>
                </div>
              </CardContent>
            </Card>
          );
        } else if (item.type === 'facebook') {
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FacebookIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Facebook</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mb-3">{item.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-3">{item.reactions} reactions</span>
                  <span className="mr-3">{item.comments} comments</span>
                  <span>{item.shares} shares</span>
                </div>
              </CardContent>
            </Card>
          );
        } else if (item.type === 'twitter') {
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <TwitterIcon className="h-4 w-4 text-sky-500 mr-2" />
                    <span className="text-sm font-medium">Twitter</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mb-3">{item.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">{item.likes} likes</span>
                  <span>{item.retweets} retweets</span>
                </div>
              </CardContent>
            </Card>
          );
        }

        return null;
      });
    };

    return (
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderFeedItems()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users2Icon className="h-5 w-5 mr-2" />
          Social Media Feeds
        </CardTitle>
        <CardDescription>
          Latest posts from our social media accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderFeeds()}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => window.open('https://twitter.com/tesco_compare', '_blank')}>
          Follow Us
        </Button>
      </CardFooter>
    </Card>
  );
};

interface SocialMetricsProps {}

export const SocialMediaMetrics: React.FC<SocialMetricsProps> = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch social media metrics from the API
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/social-media/metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Error fetching social media metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const LoadingState = () => (
    <Card>
      <CardContent className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return <LoadingState />;
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Unable to load social media metrics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart4Icon className="h-5 w-5 mr-2" />
          Social Media Analytics
        </CardTitle>
        <CardDescription>
          Performance metrics across social platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total shares by platform */}
          <div>
            <h4 className="text-sm font-medium mb-4">Shares by Platform</h4>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(metrics.shares.platforms).map(([platform, count]: [string, any]) => (
                <div key={platform} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-2">
                    {platform === 'facebook' && <FacebookIcon className="h-6 w-6 text-blue-600" />}
                    {platform === 'twitter' && <TwitterIcon className="h-6 w-6 text-sky-500" />}
                    {platform === 'linkedin' && <LinkedinIcon className="h-6 w-6 text-blue-700" />}
                    {platform === 'instagram' && <InstagramIcon className="h-6 w-6 text-pink-600" />}
                    {platform === 'whatsapp' && <SiWhatsapp className="h-6 w-6 text-green-500" />}
                    {platform === 'telegram' && <SiTelegram className="h-6 w-6 text-blue-500" />}
                    {platform === 'tiktok' && <SiTiktok className="h-6 w-6 text-black" />}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-500 capitalize">{platform}</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-right mt-2 text-gray-500">{metrics.shares.trend}</div>
          </div>

          {/* Engagement metrics */}
          <div>
            <h4 className="text-sm font-medium mb-4">Engagement Overview</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(metrics.engagement.types).map(([type, count]: [string, any]) => (
                <div key={type} className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{type}</div>
                </div>
              ))}
            </div>
            <div className="text-sm text-right mt-2 text-gray-500">{metrics.engagement.trend}</div>
          </div>

          {/* Top Products */}
          <div>
            <h4 className="text-sm font-medium mb-3">Top Shared Products</h4>
            <div className="space-y-2">
              {metrics.topProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{product.name}</span>
                  <span className="text-sm font-medium">{product.shares} shares</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {metrics.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center text-sm p-2 border-b border-gray-100">
                  {activity.platform === 'facebook' && <FacebookIcon className="h-4 w-4 text-blue-600 mr-2" />}
                  {activity.platform === 'twitter' && <TwitterIcon className="h-4 w-4 text-sky-500 mr-2" />}
                  {activity.platform === 'whatsapp' && <SiWhatsapp className="h-4 w-4 text-green-500 mr-2" />}
                  <div className="flex-1">
                    <span className="font-medium capitalize">{activity.action}</span>
                    {activity.product && <span> - {activity.product}</span>}
                    {activity.content && <span className="italic"> "{activity.content}"</span>}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main component that combines all social media features
export const SocialMediaDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6">Social Media</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SocialMediaLogin />
        <SocialMediaMetrics />
      </div>
      
      <SocialMediaFeeds maxItems={6} />
    </div>
  );
};

export default SocialMediaDashboard;