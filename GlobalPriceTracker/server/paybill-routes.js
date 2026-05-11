/**
 * API Routes for Mini Paybill System
 * 
 * These routes expose the paybill service functionality via RESTful API endpoints.
 */

import express from 'express';
import paybillService from './paybill-service.js';

const router = express.Router();

// Middleware to validate phone number
function validatePhoneNumber(req, res, next) {
  const phoneNumber = req.body.phoneNumber || req.query.phoneNumber;
  
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  // Simple regex for phone number validation (can be enhanced for specific formats)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }
  
  next();
}

// Middleware to validate amount
function validateAmount(req, res, next) {
  const amount = parseFloat(req.body.amount);
  
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Amount must be a positive number.'
    });
  }
  
  req.body.amount = amount; // Ensure amount is a number
  next();
}

// Get account balance
router.get('/balance', validatePhoneNumber, (req, res) => {
  const phoneNumber = req.query.phoneNumber;
  const balance = paybillService.getAccountBalance(phoneNumber);
  
  res.json({
    success: true,
    phoneNumber,
    balance
  });
});

// Get transaction history
router.get('/transactions', validatePhoneNumber, (req, res) => {
  const phoneNumber = req.query.phoneNumber;
  const transactions = paybillService.getTransactionHistory(phoneNumber);
  
  res.json({
    success: true,
    phoneNumber,
    count: transactions.length,
    transactions
  });
});

// Top up account
router.post('/top-up', validatePhoneNumber, validateAmount, (req, res) => {
  const { phoneNumber, amount } = req.body;
  const result = paybillService.topUpAccount(phoneNumber, amount);
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Buy airtime
router.post('/buy-airtime', validatePhoneNumber, validateAmount, (req, res) => {
  const { phoneNumber, amount, targetNumber } = req.body;
  const result = paybillService.buyAirtime(phoneNumber, amount, targetNumber);
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Pay for service
router.post('/pay-service', validatePhoneNumber, validateAmount, (req, res) => {
  const { phoneNumber, serviceId, amount, reference } = req.body;
  
  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: 'Service ID is required'
    });
  }
  
  const result = paybillService.payService(phoneNumber, serviceId, amount, reference);
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Generate receipt
router.get('/receipt/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  
  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: 'Transaction ID is required'
    });
  }
  
  const result = paybillService.generateReceipt(transactionId);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(404).json(result);
  }
});

// Get paybill information
router.get('/info', (req, res) => {
  res.json({
    success: true,
    paybillNumber: paybillService.PAYBILL_NUMBER,
    name: 'Tesco Price Comparison E-Top-Up',
    description: 'Pay for services, buy airtime, and top up your account'
  });
});

export default router;