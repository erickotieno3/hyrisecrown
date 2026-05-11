import React from 'react';
import { Helmet } from 'react-helmet';
import { SocialMediaDashboard, SocialMediaShare } from '@/components/social-media-integration';
import { Button } from '@/components/ui/button';
import { Share2Icon, Users2Icon, LogInIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SocialMediaPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Social Media Integration | Tesco Price Comparison</title>
        <meta name="description" content="Connect with Tesco Price Comparison on social media platforms and share great deals with your friends." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Social Media Integration</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect, share, and engage with the Tesco Price Comparison community across all your favorite social platforms.
          </p>
        </div>

        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">Share Great Deals</h2>
                <p className="text-gray-700 mb-6">
                  Found an amazing price comparison? Share it instantly with friends and family across Facebook, Twitter, Instagram, WhatsApp, and more.
                </p>
                <div className="flex space-x-4">
                  <SocialMediaShare 
                    title="Check out these amazing deals on Tesco Price Comparison!" 
                    description="I found the best prices across multiple stores using Tesco Price Comparison." 
                  />
                  <Button variant="outline">
                    <LogInIcon className="w-4 h-4 mr-2" />
                    Login to Share More
                  </Button>
                </div>
              </div>
              <div className="bg-blue-600 p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <Users2Icon className="w-16 h-16 mx-auto mb-4" />
                  <div className="text-2xl font-bold mb-2">Join Our Community</div>
                  <p className="mb-4">Over 50,000 users sharing price insights daily</p>
                  <div className="flex justify-center space-x-3">
                    {socialPlatformIcons.map((platform) => (
                      <div key={platform.name} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        {platform.icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Why Connect Social Media?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <SocialMediaDashboard />
      </div>
    </div>
  );
};

const socialPlatformIcons = [
  { 
    name: 'facebook', 
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
  },
  { 
    name: 'twitter', 
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10C2.38 10 2.38 10 2.38 10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" /></svg>
  },
  { 
    name: 'instagram', 
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.00042,10.68a1.32,1.32,0,1,0,1.32,1.32A1.32,1.32,0,0,0,12.00042,10.68ZM16.69,10.68a1.32,1.32,0,1,0,1.32,1.32A1.32,1.32,0,0,0,16.69,10.68ZM7.31042,10.68a1.32,1.32,0,1,0,1.32,1.32A1.32,1.32,0,0,0,7.31042,10.68ZM12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,1.47,5.23A7.26,7.26,0,0,0,7.69,21a50.63,50.63,0,0,0,8.62,0,7.26,7.26,0,0,0,4.22-3.77A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,0,1-6.92-4h13.84A8,8,0,0,1,12,20Z" /></svg>
  },
  { 
    name: 'linkedin', 
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z" /></svg>
  },
];

const benefits = [
  {
    title: 'One-Click Sharing',
    description: 'Quickly share price comparisons and deals across all your favorite social media platforms with just one click.',
    icon: <Share2Icon className="h-6 w-6 text-blue-600" />
  },
  {
    title: 'Social Login',
    description: 'Sign in effortlessly using your existing social media accounts for a seamless experience.',
    icon: <LogInIcon className="h-6 w-6 text-blue-600" />
  },
  {
    title: 'Stay Connected',
    description: 'Follow our social feeds directly in the app to stay updated on the latest deals and price alerts.',
    icon: <Users2Icon className="h-6 w-6 text-blue-600" />
  },
];

export default SocialMediaPage;