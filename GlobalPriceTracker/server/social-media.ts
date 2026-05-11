/**
 * Social Media Integration Service
 * 
 * This module provides functionality for integrating with various social media platforms including:
 * - Social media sharing
 * - Social login
 * - Social media posting
 * - Metrics and analytics
 */
import { Router, Response } from 'express';
import { Request } from 'express-serve-static-core';
import { storage } from './storage';
import session from 'express-session';

// Add declaration for session in Request
declare module 'express-session' {
  interface SessionData {
    socialUser: any;
    userId?: number;
  }
}

// Add declaration to express Request
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}

export const socialMediaRouter = Router();

// Social login endpoints
socialMediaRouter.get('/auth/facebook', (req: Request, res: Response) => {
  // In a production environment, this would redirect to Facebook OAuth
  // For demonstration, we'll simulate the process
  res.redirect('/api/social-media/auth/callback?provider=facebook&demo=true');
});

socialMediaRouter.get('/auth/google', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=google&demo=true');
});

socialMediaRouter.get('/auth/linkedin', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=linkedin&demo=true');
});

socialMediaRouter.get('/auth/twitter', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=twitter&demo=true');
});

socialMediaRouter.get('/auth/instagram', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=instagram&demo=true');
});

socialMediaRouter.get('/auth/tiktok', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=tiktok&demo=true');
});

socialMediaRouter.get('/auth/snapchat', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=snapchat&demo=true');
});

socialMediaRouter.get('/auth/whatsapp', (req: Request, res: Response) => {
  // WhatsApp typically uses phone number verification rather than OAuth
  // For demo purposes, we'll simulate the process
  res.redirect('/api/social-media/auth/callback?provider=whatsapp&demo=true');
});

socialMediaRouter.get('/auth/telegram', (req: Request, res: Response) => {
  res.redirect('/api/social-media/auth/callback?provider=telegram&demo=true');
});

socialMediaRouter.get('/auth/callback', (req: Request, res: Response) => {
  const { provider, demo } = req.query;
  
  if (demo) {
    // Demo mode - create a sample user session
    const demoUser = {
      id: 12345,
      name: `Demo ${provider} User`,
      email: `demo_${provider}_user@example.com`,
      provider: provider
    };
    
    // In a real app, we would store the user in session
    req.session.socialUser = demoUser;
    return res.redirect('/profile?social_login=success');
  }

  // Handle real authentication in production
  res.status(501).json({ error: 'Full social authentication implementation requires provider app credentials' });
});

// Social sharing endpoints
socialMediaRouter.post('/share', async (req: Request, res: Response) => {
  try {
    const { platform, content, productId } = req.body;
    
    if (!platform || !content) {
      return res.status(400).json({ error: 'Platform and content are required' });
    }
    
    // In a real implementation, this would use the platform's API to post content
    // For now, we'll just record the share event
    
    // Get additional data if sharing a product
    let productData = null;
    if (productId) {
      productData = await storage.getProduct(parseInt(productId));
    }
    
    // Record share event
    const shareEvent = {
      platform,
      content,
      productId: productId ? parseInt(productId) : null,
      productName: productData?.name || null,
      timestamp: new Date(),
      userId: req.session.userId || null
    };
    
    // In a production app, we would store this in the database
    console.log('Social media share event:', shareEvent);
    
    res.status(200).json({ 
      success: true,
      message: `Content successfully shared to ${platform}`,
      shareUrl: generateDemoShareUrl(platform, content, productId)
    });
  } catch (error) {
    console.error('Error sharing to social media:', error);
    res.status(500).json({ error: 'Failed to share content' });
  }
});

// Get shareable links
socialMediaRouter.get('/share-links/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Valid product ID is required' });
    }
    
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Generate sharing links for various platforms
    const shareUrl = encodeURIComponent(`https://hyrisecrown.com/products/${productId}`);
    const shareTitle = encodeURIComponent(`Check out ${product.name} on HyriseCrown!`);
    const shareDescription = encodeURIComponent(product.description || 'Great deals on products you love');
    
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
      email: `mailto:?subject=${shareTitle}&body=${shareDescription}%0A${shareUrl}`
    };
    
    res.json({
      product,
      shareLinks
    });
  } catch (error) {
    console.error('Error generating share links:', error);
    res.status(500).json({ error: 'Failed to generate share links' });
  }
});

// Social media feed integration
socialMediaRouter.get('/feeds', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch content from the social media APIs
    // For now, we'll return mocked data
    
    const feeds = {
      instagram: [
        {
          id: 'inst_123',
          platform: 'instagram',
          postUrl: 'https://instagram.com/p/example1',
          imageUrl: 'https://via.placeholder.com/300x300?text=Instagram+Post',
          caption: 'Check out our latest arrivals! #tesco #shopping',
          likes: 45,
          comments: 8,
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'inst_124',
          platform: 'instagram',
          postUrl: 'https://instagram.com/p/example2',
          imageUrl: 'https://via.placeholder.com/300x300?text=Instagram+Post+2',
          caption: 'Summer deals are here! #deals #summer',
          likes: 72,
          comments: 14,
          date: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      facebook: [
        {
          id: 'fb_123',
          platform: 'facebook',
          postUrl: 'https://facebook.com/example1',
          content: 'Today only: 20% off all electronics! Shop now at our online store.',
          reactions: 89,
          shares: 12,
          comments: 7,
          date: new Date(Date.now() - 43200000).toISOString()
        }
      ],
      twitter: [
        {
          id: 'tw_123',
          platform: 'twitter',
          postUrl: 'https://twitter.com/example1',
          content: 'New price comparison feature just launched! Compare prices across multiple stores instantly.',
          likes: 32,
          retweets: 11,
          date: new Date(Date.now() - 129600000).toISOString()
        }
      ]
    };
    
    res.json({ feeds });
  } catch (error) {
    console.error('Error fetching social media feeds:', error);
    res.status(500).json({ error: 'Failed to fetch social media feeds' });
  }
});

// Helper function to generate demo share URLs
function generateDemoShareUrl(platform: string, content: string, productId?: number): string {
  const baseUrl = 'https://hyrisecrown.com';
  const shareParam = encodeURIComponent(content);
  const productParam = productId ? `&productId=${productId}` : '';
  
  switch (platform.toLowerCase()) {
    case 'facebook':
      return `https://facebook.com/sharer/sharer.php?u=${baseUrl}/shared${productParam}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${shareParam}&url=${baseUrl}/shared${productParam}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}/shared${productParam}`;
    case 'whatsapp':
      return `https://wa.me/?text=${shareParam}%20${baseUrl}/shared${productParam}`;
    case 'telegram':
      return `https://t.me/share/url?url=${baseUrl}/shared${productParam}&text=${shareParam}`;
    case 'tiktok':
      return `${baseUrl}/shared?platform=tiktok${productParam}`;
    case 'snapchat':
      return `${baseUrl}/shared?platform=snapchat${productParam}`;
    case 'instagram':
      return `${baseUrl}/shared?platform=instagram${productParam}`;
    default:
      return `${baseUrl}/shared?platform=${platform}${productParam}`;
  }
}

// Social media metrics
socialMediaRouter.get('/metrics', (req: Request, res: Response) => {
  // In a real app, this would fetch metrics from social media APIs and our database
  // For now, we'll return demo data
  
  const metrics = {
    shares: {
      total: 1482,
      platforms: {
        facebook: 532,
        twitter: 246,
        whatsapp: 389,
        instagram: 98,
        linkedin: 127,
        telegram: 54,
        tiktok: 36
      },
      trend: '+12% from last month'
    },
    engagement: {
      total: 4826,
      types: {
        likes: 3245,
        comments: 876,
        shares: 705
      },
      trend: '+8% from last month'
    },
    topProducts: [
      { id: 1, name: 'Product 1', shares: 145 },
      { id: 7, name: 'Product 7', shares: 97 },
      { id: 3, name: 'Product 3', shares: 84 },
    ],
    recentActivity: [
      { platform: 'facebook', action: 'share', product: 'Product 2', time: '2 hours ago' },
      { platform: 'whatsapp', action: 'share', product: 'Product 5', time: '4 hours ago' },
      { platform: 'twitter', action: 'mention', content: '@tesco_compare great deals!', time: '6 hours ago' }
    ]
  };
  
  res.json({ metrics });
});