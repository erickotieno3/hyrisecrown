import { useState } from "react";
import { 
  Menu, 
  Mail, 
  User, 
  Search, 
  ChevronDown, 
  Plus, 
  Image 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock product data for demonstration
const mockProducts = [
  { id: 1, name: "Product name", price: 19.99, image: "" },
  { id: 2, name: "Product name", price: 24.99, image: "" },
  { id: 3, name: "Product name", price: 14.50, image: "" },
];

export default function VendorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Menu className="h-6 w-6 mr-3" />
          <h1 className="font-bold text-lg uppercase">DASHBOARD</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Mail className="h-6 w-6" />
          <User className="h-6 w-6" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Vendor Dashboard</h2>
        
        {/* Logo Area */}
        <div className="bg-gray-200 rounded-lg py-8 mb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-400 mx-auto flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-gray-700"
              >
                <path d="M4 16L8 4L12 16L16 4L20 16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="font-bold mt-2 text-gray-700">LOGO</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold uppercase">Products</p>
            <p className="font-bold text-xl">120</p>
          </div>
          <div className="border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold uppercase">Sales</p>
            <p className="font-bold text-xl">230</p>
          </div>
          <div className="border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold uppercase">Reviews</p>
            <p className="font-bold text-xl">4,5</p>
          </div>
          <div className="border border-gray-800 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold uppercase">Earnings</p>
            <p className="font-bold text-xl">3,200</p>
          </div>
        </div>
        
        {/* Add Product Button */}
        <Button 
          className="w-full bg-gray-300 hover:bg-gray-400 text-black mb-6 py-5 font-medium rounded-lg"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </Button>
        
        {/* Product Listings */}
        <div>
          <h3 className="font-bold text-xl mb-4">Product Listings</h3>
          
          {/* Search and Filters */}
          <div className="flex space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                className="pl-10 py-5 border-gray-400 rounded-lg" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-gray-400 rounded-lg">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Product List */}
          <div className="space-y-4">
            {mockProducts.map(product => (
              <div key={product.id} className="flex items-center py-4">
                <div className="w-20 h-20 bg-gray-200 mr-4 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-8 w-8 text-gray-400"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Product name</h4>
                  <div className="flex flex-col">
                    <div className="bg-gray-200 h-2 w-full max-w-xs my-2 rounded-full"></div>
                    <div className="bg-gray-200 h-2 w-full max-w-xs my-1 rounded-full"></div>
                  </div>
                </div>
                <div className="w-20 text-right mr-4">
                  <p className="font-bold">Price</p>
                  <div className="flex flex-col items-end">
                    <div className="bg-gray-200 h-2 w-full max-w-[50px] my-2 rounded-full"></div>
                    <div className="bg-gray-200 h-2 w-full max-w-[80px] my-1 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-2 text-right w-20">
                  <p className="font-bold">EDIT</p>
                  <Button 
                    className="mt-2 bg-gray-200 hover:bg-gray-300 text-black text-sm h-8 px-4 rounded"
                  >
                    EDIT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}