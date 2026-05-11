import React from 'react';
import { Helmet } from 'react-helmet';
import PaybillPortal from '@/components/paybill-portal';

export default function PaybillPage() {
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>787878 E-Top-Up Portal | Tesco Price Comparison</title>
        <meta name="description" content="Use our 787878 E-Top-Up portal to add funds to your account, buy airtime, or pay for various services." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">787878 E-Top-Up Portal</h1>
        <p className="text-gray-600">
          Easily manage your account, buy airtime, and pay for services
        </p>
      </div>
      
      <PaybillPortal />
      
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">How to Use Our E-Top-Up Service</h2>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <span className="font-bold text-blue-700">1</span>
            </div>
            <h3 className="font-semibold mb-2">Top Up Your Account</h3>
            <p className="text-sm text-gray-600">Add funds to your account to use for airtime purchases and service payments.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <span className="font-bold text-blue-700">2</span>
            </div>
            <h3 className="font-semibold mb-2">Buy Airtime</h3>
            <p className="text-sm text-gray-600">Purchase airtime for yourself or for friends and family using your account balance.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <span className="font-bold text-blue-700">3</span>
            </div>
            <h3 className="font-semibold mb-2">Pay for Services</h3>
            <p className="text-sm text-gray-600">Easily pay for utilities, subscriptions, and other services using your balance.</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700">
            If you need assistance with your payments or have questions about our E-Top-Up service, 
            please contact customer support at erickotienokjv@gmail.com or call +254 (0) 700 000 000.
          </p>
        </div>
      </div>
    </div>
  );
}