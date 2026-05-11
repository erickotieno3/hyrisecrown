import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import analytics from '@/lib/analytics';
import payments, { type PaymentMethod } from '@/lib/payments';
import { AffiliateBanner } from '@/components/common/AffiliateLink';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

/**
 * Checkout Page Component
 * 
 * This page handles the checkout process with multiple payment options including:
 * - Stripe (Credit/Debit cards)
 * - PayPal
 * - M-Pesa (for African countries)
 * - Other regional payment methods
 */
export default function CheckoutPage() {
  const [location, setLocation] = useLocation();
  const [amount, setAmount] = useState(10); // Default to $10
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedTab, setSelectedTab] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/checkout', 'Checkout - Tesco Price Comparison');
    
    // Get available payment methods based on country
    const methods = payments.getAvailablePaymentMethods(country);
    setPaymentMethods(methods);
    
    // Set default tab to the first available payment method
    if (methods.length > 0 && methods[0] === 'mpesa') {
      setSelectedTab('mpesa');
    }
  }, [country]);

  // Initialize Stripe payment intent when needed
  useEffect(() => {
    if (selectedTab === 'card' && amount > 0) {
      setLoading(true);
      payments.createStripePayment(amount, currency)
        .then(secret => {
          setClientSecret(secret);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error creating payment intent:', error);
          toast({
            title: 'Payment Error',
            description: 'Could not initialize payment. Please try again later.',
            variant: 'destructive',
          });
          setLoading(false);
        });
    }
  }, [selectedTab, amount, currency, toast]);

  // Handle country selection
  const handleCountryChange = (value: string) => {
    setCountry(value);
    
    // Set currency based on country
    switch (value) {
      case 'KE':
      case 'TZ':
      case 'UG':
        setCurrency('KES');
        break;
      case 'GB':
        setCurrency('GBP');
        break;
      case 'EU':
        setCurrency('EUR');
        break;
      default:
        setCurrency('USD');
    }
    
    // Update available payment methods
    setPaymentMethods(payments.getAvailablePaymentMethods(value));
  };

  // Handle M-Pesa payment
  const handleMPesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await payments.createMPesaPayment(phoneNumber, amount);
      
      toast({
        title: 'M-Pesa Payment Initiated',
        description: 'Please check your phone to complete the payment.',
      });
      
      // Redirect to confirmation page after a brief delay
      setTimeout(() => {
        setLocation('/payment-confirmation?method=mpesa');
      }, 3000);
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Could not process M-Pesa payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          
          <div className="grid gap-4 mb-6">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-32 ml-2">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="KE">Kenya</SelectItem>
                  <SelectItem value="TZ">Tanzania</SelectItem>
                  <SelectItem value="UG">Uganda</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {paymentMethods.includes('stripe') && (
                <TabsTrigger value="card">Credit Card</TabsTrigger>
              )}
              {paymentMethods.includes('paypal') && (
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
              )}
              {paymentMethods.includes('mpesa') && (
                <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
              )}
            </TabsList>
            
            {/* Stripe Credit Card Payment */}
            {paymentMethods.includes('stripe') && (
              <TabsContent value="card" className="mt-4">
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeCheckoutForm />
                  </Elements>
                ) : (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </TabsContent>
            )}
            
            {/* PayPal Payment */}
            {paymentMethods.includes('paypal') && (
              <TabsContent value="paypal" className="mt-4">
                <PayPalScriptProvider options={{ 
                  'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
                  currency: currency
                }}>
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: amount.toString(),
                              currency_code: currency
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order!.capture().then((details) => {
                        const name = details.payer.name?.given_name;
                        toast({
                          title: 'Payment Successful',
                          description: `Thank you, ${name}!`,
                        });
                        
                        // Track the payment
                        payments.trackPaymentComplete('paypal', amount, currency);
                        
                        // Redirect to confirmation
                        setLocation('/payment-confirmation?method=paypal');
                      });
                    }}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      toast({
                        title: 'Payment Failed',
                        description: 'PayPal payment could not be processed. Please try again.',
                        variant: 'destructive',
                      });
                    }}
                    style={{ layout: 'vertical' }}
                  />
                </PayPalScriptProvider>
              </TabsContent>
            )}
            
            {/* M-Pesa Payment */}
            {paymentMethods.includes('mpesa') && (
              <TabsContent value="mpesa" className="mt-4">
                <div className="space-y-4">
                  <p className="text-sm">
                    Pay with M-Pesa by entering your phone number below. You will receive a prompt
                    on your phone to complete the payment.
                  </p>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number (with country code)</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., +254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleMPesaPayment} 
                    disabled={loading || !phoneNumber}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Processing...
                      </>
                    ) : (
                      'Pay with M-Pesa'
                    )}
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      {/* Legal Information */}
      <div className="max-w-2xl mx-auto">
        <AffiliateBanner />
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              All payments are processed securely through our payment partners. Your payment
              information is never stored on our servers.
            </p>
            <p>
              By proceeding with payment, you agree to our 
              <a href="/terms" className="text-blue-600 hover:underline"> Terms of Service</a> and
              <a href="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stripe Checkout Form Component
 */
function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment('', {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Tesco Customer',
        },
      },
    });

    if (error) {
      setError(error.message || 'An error occurred');
      setProcessing(false);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong with your payment',
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      
      // Track the payment
      payments.trackPaymentComplete('stripe', 
        paymentIntent.amount / 100, // Convert from cents
        paymentIntent.currency.toUpperCase()
      );
      
      toast({
        title: 'Payment Successful',
        description: 'Thank you for your payment!',
      });
      
      // Redirect to confirmation page
      setTimeout(() => {
        setLocation('/payment-confirmation?method=card');
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="card-element">Credit or Debit Card</Label>
        <div className="mt-1 p-3 border rounded-md">
          <CardElement 
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || processing || succeeded}
        className="w-full"
      >
        {processing ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Processing...
          </>
        ) : succeeded ? (
          'Payment Successful!'
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
}