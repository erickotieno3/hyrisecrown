import React, { useState, useEffect, useCallback } from 'react';

// WebSocket readyState constants for cross-browser compatibility
const WS_CONNECTING = 0;
const WS_OPEN = 1;
const WS_CLOSING = 2;
const WS_CLOSED = 3;

interface WebSocketStatusProps {
  productId?: number;
  countryCode?: string;
}

export default function WebSocketStatus({ productId, countryCode }: WebSocketStatusProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      setError(null);
      
      // Subscribe to product updates if productId is provided
      if (productId) {
        ws.send(JSON.stringify({
          type: 'subscribe_product',
          productId
        }));
      }
      
      // Subscribe to country updates if countryCode is provided
      if (countryCode) {
        ws.send(JSON.stringify({
          type: 'subscribe_country',
          countryCode
        }));
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [data, ...prev].slice(0, 10)); // Keep only the latest 10 messages
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Connection error. Please try again later.');
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [productId, countryCode]);
  
  // Function to send a test message
  const sendTestMessage = useCallback(() => {
    if (socket && socket.readyState === WS_OPEN) {
      socket.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    } else {
      setError('Socket is not connected');
    }
  }, [socket]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">WebSocket Status</h3>
        <div className="flex items-center mt-2">
          <div className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-sm text-gray-700">
            {connected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="p-2 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={sendTestMessage}
          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send Test Message
        </button>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h4>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {messages.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {messages.map((msg, index) => (
                  <li key={index} className="p-3 text-xs font-mono bg-gray-50">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(msg, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-sm text-gray-500 text-center">No messages received yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}