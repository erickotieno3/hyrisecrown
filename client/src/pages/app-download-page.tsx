import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import analytics from '@/lib/analytics';
import { AffiliateBanner } from '@/components/common/AffiliateLink';

export default function AppDownloadPage() {
  useEffect(() => {
    analytics.trackPageView('/app-download', 'Download the Tesco Price Comparison App');
  }, []);

  const handleDownloadClick = (platform: 'android' | 'ios') => {
    analytics.trackAppDownload(platform);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Download Our Mobile App</h1>
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Tesco Price Comparison</h2>
            <p className="mb-4 text-gray-700">
              Compare prices across multiple retailers with a simple mobile app. Our app offers:
            </p>
            
            <ul className="list-disc pl-5 mb-6 text-gray-700 space-y-2">
              <li>Price comparisons from multiple stores</li>
              <li>Barcode scanning for quick product lookup</li>
              <li>Price alerts for products you follow</li>
              <li>Offline shopping lists that sync across devices</li>
              <li>Multi-language support</li>
              <li>Location-based store recommendations</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button 
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg flex items-center justify-center"
                onClick={() => handleDownloadClick('ios')}
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </Button>
              
              <Button 
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg flex items-center justify-center"
                onClick={() => handleDownloadClick('android')}
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V6c0-1.1,0.9-2,2-2h14c1.1,0,2,0.9,2,2v14.5c0,1.1-0.9,2-2,2H5C3.9,22.5,3,21.6,3,20.5 M14.6,13.8l-3,1.8 c-0.4,0.3-1-0.1-1-0.8V11c0-0.7,0.6-1.1,1-0.8l3,1.8C15,12.2,15,13.6,14.6,13.8z" />
                </svg>
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md">
              <p className="text-sm text-center text-gray-500 mb-3 font-medium">Scan to open on your phone</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/app-download')}&color=00539f&bgcolor=ffffff`}
                alt="QR Code to download the app"
                className="w-48 h-48 mx-auto"
              />
              <p className="text-xs text-center text-gray-400 mt-3">{window.location.origin}/app-download</p>
            </div>
            <p className="text-sm text-gray-500 text-center">Point your camera at the QR code<br/>to open the app instantly</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto mt-8">
        <AffiliateBanner />
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Legal Information</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              The Tesco Price Comparison application is offered as a free service for consumers to compare 
              prices across multiple retailers. We are not affiliated with Tesco PLC or any other retailers 
              mentioned in the application, except as noted through our affiliate partnerships.
            </p>
            <p>
              By downloading and using our application, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and 
              <Link href="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</Link>.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Advertising Disclosure</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              Our free application is supported by advertising and affiliate commissions. When you click on 
              retailer links and make purchases, we may receive a commission.
            </p>
            <p>
              We use targeted advertising services including Google AdMob. You can opt out of personalized 
              advertising by adjusting your device settings or through our application settings menu.
            </p>
            <p>
              Prices and availability may change rapidly. Always verify final prices on the retailer's website before making a purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
