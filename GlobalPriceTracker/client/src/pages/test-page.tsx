import React from 'react';

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Tesco Connectivity Test
        </h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Success!</p>
          <p>Your React application is properly connected and working.</p>
        </div>
        
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">Frontend Status</h2>
            <p>✅ React is rendering correctly</p>
            <p>✅ CSS/Tailwind is working</p>
          </div>
          
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">API Connection Test</h2>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                fetch('/api/countries')
                  .then(response => response.json())
                  .then(data => {
                    alert(`API Connection Success! Received ${data.length} countries.`);
                  })
                  .catch(error => {
                    alert(`API Connection Error: ${error.message}`);
                  });
              }}
            >
              Test API Connection
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-blue-500 hover:underline"
          >
            Return to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}