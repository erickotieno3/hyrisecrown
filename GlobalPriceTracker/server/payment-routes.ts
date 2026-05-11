/**
 * Payment Processing Routes
 * 
 * This file contains routes for handling various payment methods including:
 * - Stripe (Global)
 * - PayPal (Global)
 * - M-Pesa (Africa)
 * - And other regional payment systems
 */

import { Router } from 'express';
import Stripe from 'stripe';
import type { Request, Response } from 'express';

// Create a router for payment endpoints
const paymentRouter = Router();

// Set up Stripe if STRIPE_SECRET_KEY is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil',
  });
}

/**
 * Stripe Payment Routes
 */
paymentRouter.post('/stripe/create-payment-intent', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({
      error: 'Stripe is not configured. Please set the STRIPE_SECRET_KEY environment variable.'
    });
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/smallest currency unit
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while creating the payment intent',
    });
  }
});

/**
 * PayPal Payment Routes
 */
paymentRouter.post('/paypal/create-order', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would use the PayPal SDK to create an order
    // For demonstration, we'll simulate a successful response
    
    const { amount, currency = 'USD' } = req.body;
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // This would be replaced with actual PayPal API call
    const orderID = `PAYPAL-ORDER-${Date.now()}`;
    
    res.status(200).json({
      orderID,
      status: 'CREATED',
    });
  } catch (error: any) {
    console.error('PayPal error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while creating the PayPal order',
    });
  }
});

/**
 * M-Pesa Payment Routes (popular in Kenya and other African countries)
 */
paymentRouter.post('/mpesa/initiate', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !amount) {
      return res.status(400).json({ 
        error: 'Phone number and amount are required' 
      });
    }
    
    // In a real implementation, this would integrate with M-Pesa API
    // For demonstration, we'll simulate a successful response
    
    const checkoutRequestID = `MPESA-${Date.now()}`;
    
    res.status(200).json({
      checkoutRequestID,
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: 'Please check your phone to complete the payment',
    });
  } catch (error: any) {
    console.error('M-Pesa error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while initiating M-Pesa payment',
    });
  }
});

/**
 * Webhook endpoints for payment notifications
 */

// Stripe webhook
paymentRouter.post('/stripe/webhook', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // This would verify the webhook signature with your webhook secret
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // );
    
    // For demonstration, we'll just acknowledge the webhook
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// PayPal webhook
paymentRouter.post('/paypal/webhook', (req: Request, res: Response) => {
  // This would verify and process PayPal IPN notifications
  res.status(200).json({ received: true });
});

// M-Pesa webhook
paymentRouter.post('/mpesa/callback', (req: Request, res: Response) => {
  // This would process M-Pesa payment confirmations
  res.status(200).json({ received: true });
});

export default paymentRouter;