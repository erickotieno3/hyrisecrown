/**
 * Mini Paybill System API Routes
 * 
 * This file handles all API routes for the E-Top-Up service similar to PesaPal's
 * but with our own unique paybill number (787878) and commission tracking system.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import paybillService from './paybill-service';

// Create router for paybill endpoints
const paybillRouter = Router();

// Get paybill info (number and merchant name)
paybillRouter.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    paybillNumber: paybillService.PAYBILL_NUMBER,
    name: paybillService.MERCHANT_NAME,
    description: `Pay for services, buy airtime, and top up your account with ${paybillService.MERCHANT_NAME}`
  });
});

// Get account balance
paybillRouter.get('/balance', (req: Request, res: Response) => {
  const { phoneNumber } = req.query;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }
  const balance = paybillService.getAccountBalance(phoneNumber as string);
  res.json({ success: true, balance, merchant: paybillService.MERCHANT_NAME });
});

// Get transaction history
paybillRouter.get('/transactions/:phoneNumber', (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  const transactions = paybillService.getTransactionHistory(phoneNumber);
  res.json({ transactions });
});

// Top up account
paybillRouter.post('/topup', (req: Request, res: Response) => {
  const { phoneNumber, amount } = req.body;
  
  if (!phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: 'Phone number and amount are required' });
  }
  
  const result = paybillService.topUpAccount(phoneNumber, parseFloat(amount));
  res.json(result);
});

// Buy airtime
paybillRouter.post('/airtime', (req: Request, res: Response) => {
  const { phoneNumber, amount, targetNumber } = req.body;
  
  if (!phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: 'Phone number and amount are required' });
  }
  
  const result = paybillService.buyAirtime(phoneNumber, parseFloat(amount), targetNumber);
  res.json(result);
});

// Pay for a service
paybillRouter.post('/pay-service', (req: Request, res: Response) => {
  const { phoneNumber, serviceId, amount, reference } = req.body;
  
  if (!phoneNumber || !serviceId || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number, service ID, and amount are required' 
    });
  }
  
  const result = paybillService.payService(phoneNumber, serviceId, parseFloat(amount), reference);
  res.json(result);
});

// Generate receipt
paybillRouter.get('/receipt/:transactionId', (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const result = paybillService.generateReceipt(transactionId);
  res.json(result);
});

// ADMIN ENDPOINTS - Protected with basic CSRF bypass security
// Get commission summary (for admin)
paybillRouter.get('/admin/commissions', (req: Request, res: Response) => {
  // Simple security check - this would be more robust in production
  const token = req.headers['x-admin-token'];
  if (token !== 'ADMIN_SECURE_TOKEN') {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }
  
  const commissionSummary = paybillService.getCommissionSummary();
  res.json({ success: true, data: commissionSummary });
});

// Process pending commissions (for admin)
paybillRouter.post('/admin/process-commissions', (req: Request, res: Response) => {
  // Simple security check - this would be more robust in production
  const token = req.headers['x-admin-token'];
  if (token !== 'ADMIN_SECURE_TOKEN') {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }
  
  try {
    const result = paybillService.processCommissions();
    
    if (result.success) {
      // Generate a detailed notification that would be sent via SMS/email in production
      const notificationDetails = {
        title: "Commission Transfer Complete",
        message: `Dear ${paybillService.MERCHANT_NAME}, your commission payment of $${result.totalAmount.toFixed(2)} has been transferred to your National Bank Kisumu Kenya account (${paybillService.MERCHANT_ACCOUNT}). Transfer ID: ${result.transferId}`,
        timestamp: new Date().toISOString(),
        type: "COMMISSION_TRANSFER"
      };
      
      res.json({
        success: true,
        message: `Successfully processed ${result.processedCount} commission(s) totaling $${result.totalAmount.toFixed(2)}`,
        transferDetails: {
          transferId: result.transferId,
          timestamp: new Date().toISOString(),
          amount: result.totalAmount,
          recipient: paybillService.MERCHANT_NAME,
          accountNumber: paybillService.MERCHANT_ACCOUNT,
          bank: "National Bank Kisumu Kenya"
        },
        notification: notificationDetails,
        processedCount: result.processedCount
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to process commissions',
        error: 'Unable to complete the transfer operation'
      });
    }
  } catch (error) {
    console.error('Error processing commissions:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing commissions',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get commission rates (for admin)
paybillRouter.get('/admin/commission-rates', (req: Request, res: Response) => {
  // Simple security check - this would be more robust in production
  const token = req.headers['x-admin-token'];
  if (token !== 'ADMIN_SECURE_TOKEN') {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }
  
  res.json({ 
    success: true, 
    data: paybillService.COMMISSION_RATES 
  });
});

export default paybillRouter;