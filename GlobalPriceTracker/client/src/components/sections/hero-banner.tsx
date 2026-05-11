import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroBanner() {
  const { t } = useTranslation("home");
  
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl">
          <h1 className="text-[#333333] font-bold text-5xl leading-tight mb-6">
            Compare<br />Supermarket<br />Prices
          </h1>
          <Link href="/compare">
            <Button 
              size="lg" 
              className="bg-[#0055A6] hover:bg-blue-700 text-white font-medium py-4 px-10 rounded-md mt-4"
            >
              Start Comparing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
