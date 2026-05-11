import { MarketplaceComparison } from "@/components/marketplace-comparison";

export default function MarketplaceComparisonPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Global Marketplace Price Comparison</h1>
      <p className="text-gray-600 mb-8">
        Compare product prices across multiple global online marketplaces including Amazon, eBay, AliExpress, Jumia, and Kilimall.
        Find the best deals and save money on your purchases.
      </p>
      
      <MarketplaceComparison />
    </div>
  );
}