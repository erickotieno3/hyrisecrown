import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Language } from "@shared/schema";

export default function Footer() {
  const { t, i18n } = useTranslation("common");
  
  // Fetch available languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-inter font-semibold text-lg mb-4">About Tesco</h3>
            <p className="text-gray-400">
              A global price comparison platform helping you find the best deals across supermarkets and chain stores worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link href="/countries" className="text-gray-400 hover:text-white transition">Countries</Link></li>
              <li><Link href="/stores" className="text-gray-400 hover:text-white transition">Stores</Link></li>
              <li><Link href="/trending" className="text-gray-400 hover:text-white transition">Trending Deals</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold text-lg mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li><Link href="/partners" className="text-gray-400 hover:text-white transition">Partner With Us</Link></li>
              <li><Link href="/vendor-login" className="text-gray-400 hover:text-white transition">Vendor Login</Link></li>
              <li><Link href="/upload-products" className="text-gray-400 hover:text-white transition">Upload Products</Link></li>
              <li><Link href="/api-docs" className="text-gray-400 hover:text-white transition">API Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400">
              Email: <a href="mailto:erickotienokjv@gmail.com" className="hover:text-white transition">erickotienokjv@gmail.com</a>
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            &copy; {currentYear} Tesco. All rights reserved. <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link> | <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </p>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">{t("language")}:</span>
            <Select value={i18n.language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-[140px] bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder={t("language")} />
              </SelectTrigger>
              <SelectContent>
                {languages?.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </footer>
  );
}
