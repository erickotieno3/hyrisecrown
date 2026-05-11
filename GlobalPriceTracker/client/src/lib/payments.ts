/**
 * Payment Service
 * 
 * This module provides a unified interface for handling various payment methods
 * including Stripe, PayPal, M-Pesa and other regional payment systems.
 */

import analytics from './analytics';

// Payment method types
export type PaymentMethod = 
  | 'stripe' 
  | 'paypal' 
  | 'mpesa' 
  | 'apple_pay' 
  | 'google_pay'
  | 'bank_transfer';

// Payment status
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

// Payment interface
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initialize Stripe payment
 * @param amount Amount to charge in smallest currency unit (e.g., cents)
 * @param currency Currency code (e.g., 'usd', 'gbp')
 * @returns Client secret for payment intent
 */
export const createStripePayment = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const response = await fetch('/api/payments/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create Stripe payment');
    }
    
    // Track payment initiation in analytics
    analytics.trackEvent('payment_initiated', {
      payment_method: 'stripe',
      amount,
      currency,
    });
    
    return data.clientSecret;
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
};

/**
 * Initialize PayPal payment
 * @param amount Amount to charge 
 * @param currency Currency code
 * @returns Order ID for PayPal
 */
export const createPayPalPayment = async (
  amount: number,
  currency: string = 'USD',
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create PayPal payment');
    }
    
    // Track payment initiation in analytics
    analytics.trackEvent('payment_initiated', {
      payment_method: 'paypal',
      amount,
      currency,
    });
    
    return data.orderID;
  } catch (error) {
    console.error('PayPal payment error:', error);
    throw error;
  }
};

/**
 * Initialize M-Pesa payment (popular in Kenya and other African countries)
 * @param phoneNumber Customer's phone number
 * @param amount Amount to charge
 * @returns M-Pesa checkout request ID
 */
export const createMPesaPayment = async (
  phoneNumber: string,
  amount: number,
  metadata: Record<string, any> = {}
): Promise<string> => {
  try {
    const response = await fetch('/api/payments/mpesa/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        amount,
        metadata,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create M-Pesa payment');
    }
    
    // Track payment initiation in analytics
    analytics.trackEvent('payment_initiated', {
      payment_method: 'mpesa',
      amount,
      currency: 'KES', // Kenya Shillings
    });
    
    return data.checkoutRequestID;
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    throw error;
  }
};

/**
 * Track completed payment in analytics
 * @param paymentMethod Payment method used
 * @param amount Payment amount
 * @param currency Currency code
 */
export const trackPaymentComplete = (
  paymentMethod: PaymentMethod,
  amount: number,
  currency: string
): void => {
  analytics.trackEvent('payment_completed', {
    payment_method: paymentMethod,
    amount,
    currency,
  });
};

/**
 * Get available payment methods based on user's country
 * @param countryCode ISO country code
 * @returns List of available payment methods
 */
export const getAvailablePaymentMethods = (countryCode: string): PaymentMethod[] => {
  // Default payment methods available everywhere
  const globalMethods: PaymentMethod[] = ['stripe', 'paypal'];
  
  // Regional payment methods
  switch (countryCode.toUpperCase()) {
    case 'KE': // Kenya
    case 'TZ': // Tanzania
    case 'UG': // Uganda
      return [...globalMethods, 'mpesa'];
      
    case 'US':
    case 'CA':
    case 'GB':
    case 'AU':
      return [...globalMethods, 'apple_pay', 'google_pay'];
      
    case 'DE': // Germany
    case 'FR': // France
    case 'IT': // Italy
      return [...globalMethods, 'bank_transfer'];
      
    default:
      return globalMethods;
  }
};

export default {
  createStripePayment,
  createPayPalPayment,
  createMPesaPayment,
  trackPaymentComplete,
  getAvailablePaymentMethods
};