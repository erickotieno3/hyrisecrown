import { Route, Switch, Link } from "wouter";
import MarketplaceComparisonPage from "@/pages/marketplace-comparison";
import AlphabeticalSearchPage from "@/pages/alphabetical-search";
import AutoPilotDashboardPage from "@/pages/auto-pilot-dashboard";
import AIAssistantPage from "@/pages/ai-assistant";
import SocialMediaPage from "@/pages/social-media-page";
import SavingsChallengePage from "@/pages/savings-challenge";
import PaybillPage from "@/pages/paybill-page";
import ShopifyPage from "./pages/admin/shopify-page";
import VendorLoginPage from "./pages/vendor-login";
import VendorDashboardPage from "./pages/vendor-dashboard";
import VisualSearchPage from "@/pages/visual-search-page";
import AchievementsPage from "@/pages/achievements-page";
import CreateBadgePage from "@/pages/create-badge-page";
import LegalDocumentsPage from "./pages/legal/legal-documents";
import AIAdminDashboard from "./pages/admin/ai-admin-dashboard";
import GorillaLeadsDashboard from "./pages/gorillaleads-dashboard";
import SpeechToTextPage from "@/pages/speech-to-text-page";
import LoginPage from "./pages/login";
import OAuthCallback from "./pages/auth/callback";

import { useEffect, useState } from "react";
import { getProductRecommendations } from "@/lib/ai";
import { Sparkles, Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function HomePage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const result = await getProductRecommendations(undefined, undefined, "Electronics");
        setRecommendations(result.recommendations || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Global Price Comparison</h1>
      <p className="text-xl mb-2">Welcome to the Global E-commerce Price Comparison Platform</p>
      <p className="text-gray-600 mb-8">Compare prices across multiple stores and marketplaces worldwide</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4">Store Comparison</h2>
          <p className="mb-4">Compare prices between supermarkets and chain stores</p>
          <Link href="/store-comparison">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block cursor-pointer">
              Compare Stores
            </span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4">Marketplace Comparison</h2>
          <p className="mb-4">Compare prices across global online marketplaces</p>
          <Link href="/marketplace-comparison">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block cursor-pointer">
              Compare Marketplaces
            </span>
          </Link>
        </div>
      </div>
      
      {/* AI-powered recommendations section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-blue-700">AI-Powered Recommendations</h2>
        </div>
        
        {isLoadingRecommendations ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-blue-600">Loading recommendations...</span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 text-left">
                <div className="aspect-video bg-gray-100 mb-3 flex items-center justify-center overflow-hidden rounded">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description || 'No description available'}
                </p>
                {product.price && (
                  <p className="mt-2 font-bold text-blue-600">
                    £{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 py-4">
            Explore our AI-powered shopping assistant for personalized recommendations.
          </p>
        )}
        
        <div className="mt-4">
          <Link href="/ai-assistant">
            <span className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block cursor-pointer">
              Explore AI Features
            </span>
          </Link>
        </div>
      </div>
      
      {/* New Paybill Service Promotion */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">New: 6061123 E-Top-Up Service!</h2>
        <p className="mb-4 text-blue-700">
          Use our new paybill number <span className="font-bold">6061123</span> to top up your account, 
          buy airtime, or pay for various services directly from our platform.
        </p>
        <Link href="/paybill">
          <span className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block cursor-pointer">
            Try E-Top-Up Portal
          </span>
        </Link>
      </div>
        
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Application Status</h2>
        <p className="mb-2">
          All systems operational
        </p>
        <p className="text-gray-600">
          Last Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600 cursor-pointer">Global Compare</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <Link href="/">
                  <span className="hover:text-blue-600 cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace-comparison">
                  <span className="hover:text-blue-600 cursor-pointer">Marketplaces</span>
                </Link>
              </li>
              <li>
                <Link href="/store-comparison">
                  <span className="hover:text-blue-600 cursor-pointer">Stores</span>
                </Link>
              </li>
              <li>
                <Link href="/alphabetical-search">
                  <span className="hover:text-blue-600 cursor-pointer">Product Search</span>
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant">
                  <span className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer">AI Assistant</span>
                </Link>
              </li>
              <li>
                <Link href="/social-media">
                  <span className="text-purple-600 font-medium hover:text-purple-800 cursor-pointer">Social</span>
                </Link>
              </li>
              <li>
                <Link href="/savings-challenge">
                  <span className="text-green-600 font-medium hover:text-green-800 cursor-pointer">Savings Challenge</span>
                </Link>
              </li>
              <li>
                <Link href="/paybill">
                  <span className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer">6061123 E-Top-Up</span>
                </Link>
              </li>
              <li>
                <Link href="/visual-search">
                  <span className="text-pink-600 font-medium hover:text-pink-800 cursor-pointer">Visual Search</span>
                </Link>
              </li>
              <li>
                <Link href="/achievements">
                  <span className="text-amber-600 font-medium hover:text-amber-800 cursor-pointer">Achievements</span>
                </Link>
              </li>
              <li>
                <Link href="/leads">
                  <span className="text-purple-600 font-medium hover:text-purple-800 cursor-pointer">Lead Gen</span>
                </Link>
              </li>
              <li>
                <Link href="/speech-to-text">
                  <span className="text-indigo-600 font-medium hover:text-indigo-800 cursor-pointer">Speech to Text</span>
                </Link>
              </li>
              <li>
                <Link href="/vendor-login">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 cursor-pointer">Vendor Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/auto-pilot-dashboard">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 cursor-pointer">Admin</span>
                </Link>
              </li>
              {user ? (
                <li className="flex items-center gap-2">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    title={user.name}
                    style={{ borderRadius: '50%', width: '32px', height: '32px' }} 
                  />
                  <button 
                    onClick={logout}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link href="/login">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer">Login</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Tesco Price Comparison</h3>
            <p className="text-gray-600">
              Compare prices across multiple stores and marketplaces worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace-comparison">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Marketplace Comparison</span>
                </Link>
              </li>
              <li>
                <Link href="/store-comparison">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Store Comparison</span>
                </Link>
              </li>
              <li>
                <Link href="/social-media">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Social Media</span>
                </Link>
              </li>
              <li>
                <Link href="/savings-challenge">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Savings Challenge</span>
                </Link>
              </li>
              <li>
                <Link href="/paybill">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">787878 E-Top-Up</span>
                </Link>
              </li>
              <li>
                <Link href="/vendor-login">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Vendor Login</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-gray-600 hover:text-blue-600 cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Global Price Comparison. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you are looking for does not exist.</p>
      <Link href="/">
        <span className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 inline-block cursor-pointer">
          Go Back Home
        </span>
      </Link>
    </div>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '319956223388-2cu53nbqjqumsukct0vnnnqotgg10cas.apps.googleusercontent.com';

  return (
    <AuthProvider clientId={clientId}>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/auth/callback" component={OAuthCallback} />
          <Route path="/marketplace-comparison" component={MarketplaceComparisonPage} />
          <Route path="/alphabetical-search" component={AlphabeticalSearchPage} />
          <Route path="/ai-assistant" component={AIAssistantPage} />
          <Route path="/auto-pilot-dashboard" component={AutoPilotDashboardPage} />
          <Route path="/social-media" component={SocialMediaPage} />
          <Route path="/savings-challenge" component={SavingsChallengePage} />
          <Route path="/paybill" component={PaybillPage} />
          <Route path="/admin/shopify" component={ShopifyPage} />
          <Route path="/vendor-login" component={VendorLoginPage} />
          <Route path="/vendor-dashboard" component={VendorDashboardPage} />
          <Route path="/visual-search" component={VisualSearchPage} />
          <Route path="/achievements" component={AchievementsPage} />
          <Route path="/create-badge" component={CreateBadgePage} />
          <Route path="/leads" component={GorillaLeadsDashboard} />
          <Route path="/speech-to-text" component={SpeechToTextPage} />
          <Route path="/legal" component={LegalDocumentsPage} />
          <Route path="/admin/ai-dashboard" component={AIAdminDashboard} />
          <Route path="/tesco-vendor">
            {() => {
              // Redirect to the direct HTML vendor login page
              window.location.href = "/tesco-vendor";
              return null;
            }}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
