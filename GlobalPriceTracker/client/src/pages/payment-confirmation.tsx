import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import analytics from '@/lib/analytics';

/**
 * Payment Confirmation Page
 * 
 * This page is shown after a successful payment
 */
export default function PaymentConfirmationPage() {
  const [_, params] = useLocation();
  const queryParams = new URLSearchParams(params);
  const paymentMethod = queryParams.get('method') || 'card';
  
  useEffect(() => {
    // Track page view
    analytics.trackPageView(
      '/payment-confirmation', 
      'Payment Confirmation - Tesco Price Comparison'
    );
  }, []);
  
  // Customize message based on payment method
  const getMessage = () => {
    switch (paymentMethod) {
      case 'paypal':
        return 'Your PayPal payment has been processed successfully.';
      case 'mpesa':
        return 'Your M-Pesa payment has been initiated. Please check your phone to complete the transaction.';
      case 'bank_transfer':
        return 'Your bank transfer has been initiated. Please allow 1-3 business days for processing.';
      default:
        return 'Your payment has been processed successfully.';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">{getMessage()}</p>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                1
              </div>
              <div>
                <p className="text-gray-700">
                  Download our mobile application to access premium features.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                2
              </div>
              <div>
                <p className="text-gray-700">
                  Set up price alerts to be notified when prices drop at your favorite stores.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                3
              </div>
              <div>
                <p className="text-gray-700">
                  Start comparing prices and saving money today!
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/app-download">Download Our App</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500">
          If you have any questions about your payment or need assistance, please
          <Link href="/contact" className="text-blue-600 hover:underline"> contact our support team</Link>.
        </p>
      </div>
    </div>
  );
}