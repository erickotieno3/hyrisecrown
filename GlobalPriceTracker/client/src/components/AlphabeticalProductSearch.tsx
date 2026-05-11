import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
}

interface AlphabeticalProductSearchProps {
  onSelectProduct: (product: Product) => void;
}

export default function AlphabeticalProductSearch({ onSelectProduct }: AlphabeticalProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Generate alphabet
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Fetch all products
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter products by search term or selected letter
  const filteredProducts = React.useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) return [];
    
    let filtered = [...allProducts] as Product[];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (selectedLetter) {
      filtered = filtered.filter(product =>
        product.name.toUpperCase().startsWith(selectedLetter)
      );
    }
    
    return filtered;
  }, [allProducts, searchTerm, selectedLetter]);
  
  // Grouped products by first letter
  const groupedProducts = React.useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) return {} as Record<string, Product[]>;
    
    return alphabet.reduce((acc, letter) => {
      acc[letter] = (allProducts as Product[]).filter(product => 
        product.name.toUpperCase().startsWith(letter)
      );
      return acc;
    }, {} as Record<string, Product[]>);
  }, [allProducts, alphabet]);
  
  // Count of products starting with each letter
  const letterCounts = React.useMemo(() => {
    return alphabet.reduce((acc, letter) => {
      acc[letter] = groupedProducts[letter]?.length || 0;
      return acc;
    }, {} as Record<string, number>);
  }, [groupedProducts, alphabet]);

  // Handle search input change
  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value);
    if (value) {
      setSelectedLetter(null);
    }
    setDropdownOpen(true);
  }, 300);
  
  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setSearchTerm('');
    setDropdownOpen(true);
  };
  
  // Handle product selection
  const handleProductSelect = (product: Product) => {
    onSelectProduct(product);
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" ref={searchContainerRef}>
      <div className="relative">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSearchChange(e.target.value)}
            onClick={() => setDropdownOpen(true)}
          />
          <button
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Alphabet buttons */}
        <div className="flex flex-wrap gap-1 my-3">
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={`px-2 py-1 text-xs rounded-md flex flex-col items-center ${
                selectedLetter === letter
                  ? 'bg-blue-500 text-white'
                  : letterCounts[letter] > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => letterCounts[letter] > 0 && handleLetterClick(letter)}
              disabled={letterCounts[letter] === 0}
            >
              {letter}
              {letterCounts[letter] > 0 && (
                <span className="text-xs mt-1">{letterCounts[letter]}</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Dropdown for search results */}
        {dropdownOpen && (
          <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => handleProductSelect(product)}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500 truncate">{product.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No products found{searchTerm ? ` for "${searchTerm}"` : selectedLetter ? ` starting with "${selectedLetter}"` : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}