import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { AppleIcon, TabletSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import mobile app mockup images
import appScreenshotPath from "@assets/Tesco app mobile version UI 3e-0723fb16c43f.png";

export default function AppDownload() {
  const { t } = useTranslation("home");
  
  // Function to track analytics events
  const trackButtonClick = (store: string) => {
    // In a real implementation, this would use the Google Analytics API
    console.log(`Button click tracked: ${store}`);
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'app_download_click', {
        'app_store': store,
        'source': 'home_page'
      });
    }
  };
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="font-inter font-semibold text-2xl md:text-3xl mb-4">
              {t("downloadApp", "Download the Tesco Price Comparison App")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("downloadAppDescription", "Compare supermarket prices across multiple stores, find the best deals, and save money on your shopping with our easy-to-use mobile app.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackButtonClick('App Store')}
                className="inline-block bg-[#00539F] hover:bg-[#00407c] text-white rounded-lg px-4 py-2 flex items-center"
              >
                <AppleIcon className="h-6 w-6 mr-2" />
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackButtonClick('Google Play')}
                className="inline-block bg-[#00539F] hover:bg-[#00407c] text-white rounded-lg px-4 py-2 flex items-center"
              >
                <TabletSmartphone className="h-6 w-6 mr-2" />
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            
            <div className="mt-6">
              <Link href="/download-app">
                <Button variant="outline" className="text-[#00539F] border-[#00539F]">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-[280px] h-[560px] bg-[#00539F] rounded-[36px] p-3 shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-[#00539F] rounded-b-xl"></div>
              <div className="w-full h-full bg-white rounded-[28px] overflow-hidden">
                <img 
                  src={appScreenshotPath} 
                  alt="Tesco App Screenshot" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add type definition for the global window object
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}
