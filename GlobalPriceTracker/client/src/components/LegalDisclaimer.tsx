import React from 'react';

export function LegalDisclaimer() {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 mt-6">
      <h4 className="font-semibold text-gray-800 mb-2">Legal Notice & Disclaimer</h4>
      <p className="mb-2">
        This price comparison service is an independent platform and is not affiliated with, endorsed by, or in any way officially connected with any of the retail stores or brands mentioned on this site, including but not limited to Tesco, Walmart, Carrefour, Aldi, or any other branded retail chains.
      </p>
      <p className="mb-2">
        All store names, brand names, logos, and other trademarks displayed on this website are the property of their respective owners. The use of these trademarks, brand names, and retail store references is for identification and information purposes only and does not imply any endorsement or association.
      </p>
      <p className="mb-2">
        Product information, pricing, and availability are gathered from publicly available sources and are provided for informational purposes only. We make no guarantees regarding the accuracy, completeness, or reliability of this information.
      </p>
      <p>
        By using this service, you acknowledge and agree that we are not responsible for any pricing errors, product availability, or changes that may occur. Always verify information directly with the retailer before making a purchase.
      </p>
    </div>
  );
}

export default LegalDisclaimer;