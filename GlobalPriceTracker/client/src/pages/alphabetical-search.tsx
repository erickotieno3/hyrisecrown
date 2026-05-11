import React from 'react';
import ProductBrowser from '@/components/ProductBrowser';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function AlphabeticalSearch() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Alphabetical Product Search</h1>
          <p className="mt-2 text-lg text-gray-600">
            Discover products by browsing alphabetically or searching by name
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <ProductBrowser 
            title="Browse All Products" 
            showCategories={true}
            enableFiltering={true}
          />
        </div>
        
        <div className="flex justify-center space-x-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/product-finder">Try Product Finder</Link>
          </Button>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use the Alphabetical Browser</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">1. Browse by Letter</div>
              <p className="text-gray-600">
                Click on any letter to filter products that start with that letter. The number beneath each letter shows how many products are available.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">2. Search by Name</div>
              <p className="text-gray-600">
                Type in the search box to find products by name or description. The results update instantly as you type.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">3. Filter by Category</div>
              <p className="text-gray-600">
                Use the category tabs to narrow down your search to specific product types. You can combine this with alphabetical filtering.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Features of Our Product Browser</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Alphabetical Navigation</div>
              <p className="text-sm text-gray-600">
                Browse products starting with any letter of the alphabet
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Instant Search</div>
              <p className="text-sm text-gray-600">
                Search by product name with real-time results
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Category Filtering</div>
              <p className="text-sm text-gray-600">
                Filter products by categories to find exactly what you need
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Multiple View Modes</div>
              <p className="text-sm text-gray-600">
                Switch between grid and list views for your convenience
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Sorting Options</div>
              <p className="text-sm text-gray-600">
                Sort products alphabetically in ascending or descending order
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Mobile Friendly</div>
              <p className="text-sm text-gray-600">
                Responsive design that works on all devices
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Detailed Product View</div>
              <p className="text-sm text-gray-600">
                Click on any product to see more details
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-medium text-gray-900 mb-1">Active Filters Display</div>
              <p className="text-sm text-gray-600">
                See and manage your active search filters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}