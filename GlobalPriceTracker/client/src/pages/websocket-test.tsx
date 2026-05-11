import React, { useState } from 'react';
import WebSocketStatus from '@/components/WebSocketStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WebSocketTest() {
  const [productId, setProductId] = useState<number | undefined>(undefined);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const [inputProductId, setInputProductId] = useState('');
  const [inputCountryCode, setInputCountryCode] = useState('');

  const handleProductSubscribe = () => {
    const id = parseInt(inputProductId);
    if (!isNaN(id)) {
      setProductId(id);
    }
  };

  const handleCountrySubscribe = () => {
    if (inputCountryCode) {
      setCountryCode(inputCountryCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WebSocket Real-Time Updates Test</h1>
          <p className="mt-2 text-lg text-gray-600">
            Test real-time price updates and country store information via WebSockets
          </p>
        </div>

        <Tabs defaultValue="product" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product">Product Price Updates</TabsTrigger>
            <TabsTrigger value="country">Country Store Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="product" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productId">Product ID</Label>
                    <div className="flex mt-1">
                      <input
                        id="productId"
                        type="number"
                        placeholder="Enter product ID (e.g., 1)"
                        value={inputProductId}
                        onChange={(e) => setInputProductId(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-2"
                      />
                      <Button onClick={handleProductSubscribe}>Subscribe</Button>
                    </div>
                  </div>
                  
                  {productId !== undefined && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Subscribed to real-time updates for Product ID: <strong>{productId}</strong>
                      </p>
                      <WebSocketStatus productId={productId} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="country" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="countryCode">Country Code</Label>
                    <div className="flex mt-1">
                      <input
                        id="countryCode"
                        type="text"
                        placeholder="Enter country code (e.g., UK)"
                        value={inputCountryCode}
                        onChange={(e) => setInputCountryCode(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-2"
                      />
                      <Button onClick={handleCountrySubscribe}>Subscribe</Button>
                    </div>
                  </div>
                  
                  {countryCode !== undefined && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Subscribed to store updates for Country Code: <strong>{countryCode}</strong>
                      </p>
                      <WebSocketStatus countryCode={countryCode} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500 mb-4">
            <h3 className="font-medium text-gray-700">Mobile App Integration Documentation</h3>
            <p>Use these examples to integrate WebSockets in your mobile applications</p>
          </div>
          
          <div className="mt-4 bg-gray-800 text-white rounded-lg overflow-hidden text-left">
            <div className="px-4 py-2 bg-gray-700 text-xs font-medium">Swift Example (iOS)</div>
            <pre className="p-4 text-xs overflow-x-auto">
{`// Set up WebSocket connection
let url = URL(string: "wss://yourdomain.com/ws")!
let webSocketTask = URLSession.shared.webSocketTask(with: url)

// Connect and handle messages
func connect() {
    webSocketTask.resume()
    receiveMessage()
}

// Receive messages
func receiveMessage() {
    webSocketTask.receive { [weak self] result in
        switch result {
        case .success(let message):
            switch message {
            case .string(let text):
                // Handle the message
                print("Received: \\(text)")
            default:
                break
            }
            self?.receiveMessage() // Continue receiving messages
        case .failure(let error):
            print("Error: \\(error)")
        }
    }
}

// Subscribe to product updates
func subscribeToProduct(productId: Int) {
    let message = ["type": "subscribe_product", "productId": productId]
    let jsonData = try! JSONSerialization.data(withJSONObject: message)
    let jsonString = String(data: jsonData, encoding: .utf8)!
    
    let message = URLSessionWebSocketTask.Message.string(jsonString)
    webSocketTask.send(message) { error in
        if let error = error {
            print("Error sending message: \\(error)")
        }
    }
}`}
            </pre>
          </div>
          
          <div className="mt-4 bg-gray-800 text-white rounded-lg overflow-hidden text-left">
            <div className="px-4 py-2 bg-gray-700 text-xs font-medium">Kotlin Example (Android)</div>
            <pre className="p-4 text-xs overflow-x-auto">
{`// Import OkHttp WebSocket
import okhttp3.*
import okio.ByteString
import org.json.JSONObject

// Create WebSocket connection
val client = OkHttpClient()
val request = Request.Builder().url("wss://yourdomain.com/ws").build()
val webSocket = client.newWebSocket(request, object : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
        // Connection opened
    }
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        // Handle message
        val json = JSONObject(text)
        when (json.getString("type")) {
            "price_update" -> {
                // Update UI with new price data
            }
            "country_stores_update" -> {
                // Update UI with new store data
            }
        }
    }
    
    override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
        // Connection closed
    }
    
    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
        // Handle error
    }
})

// Subscribe to product updates
fun subscribeToProduct(productId: Int) {
    val json = JSONObject()
    json.put("type", "subscribe_product")
    json.put("productId", productId)
    webSocket.send(json.toString())
}`}
            </pre>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}