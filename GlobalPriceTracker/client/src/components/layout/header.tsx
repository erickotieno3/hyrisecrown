import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const { i18n } = useTranslation("common");
  
  return (
    <header className="bg-white sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Tesco Logo */}
        <Link href="/">
          <button className="flex items-center">
            <div className="text-[#EE1C2E] font-bold text-2xl">
              TESCO
            </div>
            <div className="ml-1 flex flex-col">
              <div className="bg-[#00539F] h-1 w-4 mb-0.5"></div>
              <div className="bg-[#00539F] h-1 w-4 mb-0.5"></div>
              <div className="bg-[#00539F] h-1 w-4 mb-0.5"></div>
              <div className="bg-[#00539F] h-1 w-4"></div>
            </div>
          </button>
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-8">
          <div className="relative group">
            <button className="flex items-center text-gray-800 font-medium">
              Navigation <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <Link href="/download-app">
            <button className="text-gray-800 font-medium">
              Download App
            </button>
          </Link>
          
          <Link href="/tesco-vendor">
            <button className="flex items-center text-[#00539F] font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Vendor Login
            </button>
          </Link>
          
          <div className="text-gray-800 font-medium">
            English
          </div>
          
          <div className="text-gray-800 font-medium">
            Login
          </div>
        </div>
      </div>
    </header>
  );
}
