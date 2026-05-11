import { useTranslation } from "react-i18next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import HeroBanner from "@/components/sections/hero-banner";
import CountrySelector from "@/components/sections/country-selector";
import FeaturedStores from "@/components/sections/featured-stores";
import SearchBar from "@/components/sections/search-bar";
import TrendingDeals from "@/components/sections/trending-deals";
import HowItWorks from "@/components/sections/how-it-works";
import Newsletter from "@/components/sections/newsletter";
import ProductComparison from "@/components/sections/product-comparison";
import CountriesSupport from "@/components/sections/countries-support";
import AppDownload from "@/components/sections/app-download";
import { useMobile } from "@/hooks/use-media-query";
import { BannerAd, InArticleAd, ProductListAd } from "@/components/ads";
import { AffiliateBanner } from "@/components/affiliate";
import LegalDisclaimer from "@/components/LegalDisclaimer";

export default function Home() {
  const { t } = useTranslation("home");
  const isMobile = useMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Top Banner Ad */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <BannerAd />
      </div>
      
      <main className="flex-grow">
        {/* Simple welcome section for testing */}
        <div className="py-12 bg-primary text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Tesco Price Comparison</h1>
          <p className="text-xl mb-6">Your global price comparison platform</p>
          <p className="text-lg">Compare prices across multiple countries and stores</p>
        </div>
        
        <HeroBanner />
        
        <CountrySelector />
        
        <FeaturedStores />
        
        {/* In-article Ad after the featured stores section */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <InArticleAd />
        </div>
        
        <SearchBar />
        
        <TrendingDeals />
        
        {/* Product List Ad integrated with trending deals */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <ProductListAd />
        </div>
        
        {/* Affiliate Banner for Tesco - Promoted deal */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <AffiliateBanner 
            storeId={1}
            productId={12345}
            title="Weekly Family Essentials Bundle"
            description="Save 25% on your weekly family shop with our essential bundle. Perfect for families of 4-5 people."
            bannerUrl="https://www.tesco.com/groceries/bundle/12345"
            discountPercentage={25}
            className="mb-4"
          />
        </div>
        
        <HowItWorks />
        
        <Newsletter />
        
        <ProductComparison />
        
        {/* Another In-article Ad */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
          <InArticleAd />
        </div>
        
        <CountriesSupport />
        
        <AppDownload />
      </main>
      
      {/* Bottom Banner Ad and Legal Disclaimer */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <BannerAd />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <LegalDisclaimer />
      </div>
      
      <Footer />
      
      {isMobile && <MobileNavigation />}
    </div>
  );
}
