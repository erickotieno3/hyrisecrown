import { useTranslation } from "react-i18next";
import { Globe, Store, BarChart2 } from "lucide-react";

export default function HowItWorks() {
  const { t } = useTranslation("home");
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-inter font-semibold text-2xl md:text-3xl text-center mb-10">
          {t("howItWorks")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
              <Globe size={28} />
            </div>
            <h3 className="font-medium text-lg mb-2">{t("step1Title")}</h3>
            <p className="text-gray-600">{t("step1Description")}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
              <Store size={28} />
            </div>
            <h3 className="font-medium text-lg mb-2">{t("step2Title")}</h3>
            <p className="text-gray-600">{t("step2Description")}</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
              <BarChart2 size={28} />
            </div>
            <h3 className="font-medium text-lg mb-2">{t("step3Title")}</h3>
            <p className="text-gray-600">{t("step3Description")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
