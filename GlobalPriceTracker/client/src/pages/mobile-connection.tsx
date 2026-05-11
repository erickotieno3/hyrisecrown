import React, { useState, useEffect } from 'react';

export default function MobileConnection() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    setLoading(true);
    setError(null);
    
    fetch('/api/mobile/status')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Connection error:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mobile App Connectivity Test</h1>
            <p className="text-gray-600">Check if your server can communicate with mobile applications</p>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <button
                onClick={checkConnection}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? 'Testing Connection...' : 'Test Connection'}
              </button>
            </div>
            
            {error && (
              <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="font-medium">Connection Error</p>
                <p>{error}</p>
              </div>
            )}
            
            {status && !loading && !error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-green-800">Connection Successful!</h3>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="font-medium text-gray-900">{status.status}</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-500">Version</p>
                      <p className="font-medium text-gray-900">{status.version}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Server Time</p>
                    <p className="font-medium text-gray-900">{new Date(status.serverTime).toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Message</p>
                    <p className="font-medium text-gray-900">{status.message}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded border border-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Supported Features</p>
                    <div className="flex flex-wrap gap-2">
                      {status.features.map((feature: string) => (
                        <span key={feature} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Mobile Integration Instructions</h2>
            <div className="bg-gray-50 rounded p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800">
{`// Swift Example (iOS)
func checkServerStatus() {
    let url = URL(string: "${window.location.origin}/api/mobile/status")!
    URLSession.shared.dataTask(with: url) { data, response, error in
        guard let data = data else { return }
        let status = try? JSONDecoder().decode(ServerStatus.self, from: data)
        // Handle status
    }.resume()
}

// Kotlin Example (Android)
fun checkServerStatus() {
    val url = "${window.location.origin}/api/mobile/status"
    val request = Request.Builder().url(url).build()
    
    client.newCall(request).enqueue(object : Callback {
        override fun onResponse(call: Call, response: Response) {
            val status = Gson().fromJson(response.body?.string(), ServerStatus::class.java)
            // Handle status
        }
        
        override fun onFailure(call: Call, e: IOException) {
            // Handle error
        }
    })
}`}
              </pre>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}