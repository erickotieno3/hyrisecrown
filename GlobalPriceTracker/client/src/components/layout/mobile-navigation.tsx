import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Home, Globe, Search, User, Download, Store } from "lucide-react";

export default function MobileNavigation() {
  const { t } = useTranslation("common");
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-gray-500 hover:text-primary";
  };
  
  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="grid grid-cols-6 items-center py-2">
        <Link href="/">
          <button className={`flex flex-col items-center p-2 ${isActive("/")}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{t("home")}</span>
          </button>
        </Link>
        <Link href="/countries">
          <button className={`flex flex-col items-center p-2 ${isActive("/countries")}`}>
            <Globe className="h-5 w-5" />
            <span className="text-xs mt-1">{t("countries")}</span>
          </button>
        </Link>
        <Link href="/alphabetical-search">
          <button className={`flex flex-col items-center p-2 ${isActive("/alphabetical-search")}`}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">{t("search")}</span>
          </button>
        </Link>
        <Link href="/download-app">
          <button className={`flex flex-col items-center p-2 ${isActive("/download-app")}`}>
            <Download className="h-5 w-5" />
            <span className="text-xs mt-1">{t("app", "App")}</span>
          </button>
        </Link>
        <Link href="/tesco-vendor">
          <button className={`flex flex-col items-center p-2 ${isActive("/tesco-vendor")}`}>
            <Store className="h-5 w-5" />
            <span className="text-xs mt-1">{t("vendor", "Vendor")}</span>
          </button>
        </Link>
        <Link href="/account">
          <button className={`flex flex-col items-center p-2 ${isActive("/account")}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{t("account")}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
