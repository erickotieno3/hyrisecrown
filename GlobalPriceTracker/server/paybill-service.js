/**
 * Mini Paybill System + E-Top-Up Service
 * 
 * This service provides functionality similar to PesaPal's 220220 paybill number,
 * allowing users to top up accounts, buy airtime, and perform other payment operations.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PAYBILL_NUMBER = '220220';
const DATA_FILE = path.join(__dirname, '..', 'data', 'paybill-accounts.json');
const TRANSACTIONS_FILE = path.join(__dirname, '..', 'data', 'paybill-transactions.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load accounts from file
function loadAccounts() {
  ensureDataDirectory();
  
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading accounts: ${error.message}`);
      return {};
    }
  } else {
    return {};
  }
}

// Save accounts to file
function saveAccounts(accounts) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(accounts, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving accounts: ${error.message}`);
    return false;
  }
}

// Load transactions from file
function loadTransactions() {
  ensureDataDirectory();
  
  if (fs.existsSync(TRANSACTIONS_FILE)) {
    try {
      const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading transactions: ${error.message}`);
      return [];
    }
  } else {
    return [];
  }
}

// Save transactions to file
function saveTransactions(transactions) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving transactions: ${error.message}`);
    return false;
  }
}

// Generate a transaction ID
function generateTransactionId() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Record a transaction
function recordTransaction(phoneNumber, transactionType, amount, description) {
  const transactions = loadTransactions();
  
  const transaction = {
    id: generateTransactionId(),
    phoneNumber,
    type: transactionType,
    amount,
    description,
    date: new Date().toISOString(),
    paybillNumber: PAYBILL_NUMBER
  };
  
  transactions.push(transaction);
  saveTransactions(transactions);
  
  return transaction;
}

// Get account balance
function getAccountBalance(phoneNumber) {
  const accounts = loadAccounts();
  return accounts[phoneNumber] || 0;
}

// Get transaction history for a phone number
function getTransactionHistory(phoneNumber) {
  const transactions = loadTransactions();
  return transactions.filter(t => t.phoneNumber === phoneNumber);
}

// Top up account
function topUpAccount(phoneNumber, amount) {
  if (amount <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than zero'
    };
  }
  
  const accounts = loadAccounts();
  
  if (accounts[phoneNumber]) {
    accounts[phoneNumber] += amount;
  } else {
    accounts[phoneNumber] = amount;
  }
  
  const saved = saveAccounts(accounts);
  
  if (saved) {
    const transaction = recordTransaction(
      phoneNumber,
      'TOP_UP',
      amount,
      `Account top-up via Paybill ${PAYBILL_NUMBER}`
    );
    
    return {
      success: true,
      message: `Top-up successful. New balance: ${accounts[phoneNumber].toFixed(2)}`,
      balance: accounts[phoneNumber],
      transaction
    };
  } else {
    return {
      success: false,
      message: 'Failed to save account information'
    };
  }
}

// Buy airtime
function buyAirtime(phoneNumber, amount, targetNumber = null) {
  if (amount <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than zero'
    };
  }
  
  const accounts = loadAccounts();
  const recipientNumber = targetNumber || phoneNumber;
  
  // Check if account exists and has sufficient balance
  if (!accounts[phoneNumber]) {
    return {
      success: false,
      message: 'Account not found'
    };
  }
  
  if (accounts[phoneNumber] < amount) {
    return {
      success: false,
      message: 'Insufficient balance',
      balance: accounts[phoneNumber]
    };
  }
  
  // Deduct the amount
  accounts[phoneNumber] -= amount;
  const saved = saveAccounts(accounts);
  
  if (saved) {
    const transaction = recordTransaction(
      phoneNumber,
      'AIRTIME_PURCHASE',
      amount,
      `Airtime purchase for ${recipientNumber}`
    );
    
    return {
      success: true,
      message: `Airtime purchase successful. Remaining balance: ${accounts[phoneNumber].toFixed(2)}`,
      balance: accounts[phoneNumber],
      transaction,
      recipient: recipientNumber
    };
  } else {
    return {
      success: false,
      message: 'Failed to process airtime purchase'
    };
  }
}

// Pay for a service
function payService(phoneNumber, serviceId, amount, reference = null) {
  if (amount <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than zero'
    };
  }
  
  const accounts = loadAccounts();
  
  // Check if account exists and has sufficient balance
  if (!accounts[phoneNumber]) {
    return {
      success: false,
      message: 'Account not found'
    };
  }
  
  if (accounts[phoneNumber] < amount) {
    return {
      success: false,
      message: 'Insufficient balance',
      balance: accounts[phoneNumber]
    };
  }
  
  // Deduct the amount
  accounts[phoneNumber] -= amount;
  const saved = saveAccounts(accounts);
  
  if (saved) {
    const transaction = recordTransaction(
      phoneNumber,
      'SERVICE_PAYMENT',
      amount,
      `Payment for service ${serviceId}${reference ? ` (Ref: ${reference})` : ''}`
    );
    
    return {
      success: true,
      message: `Payment successful. Remaining balance: ${accounts[phoneNumber].toFixed(2)}`,
      balance: accounts[phoneNumber],
      transaction,
      serviceId
    };
  } else {
    return {
      success: false,
      message: 'Failed to process payment'
    };
  }
}

// Generate receipt
function generateReceipt(transactionId) {
  const transactions = loadTransactions();
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    return {
      success: false,
      message: 'Transaction not found'
    };
  }
  
  // Format the receipt
  const receipt = {
    receiptNumber: `RCP-${transaction.id}`,
    paybillNumber: PAYBILL_NUMBER,
    date: new Date(transaction.date).toLocaleString(),
    phoneNumber: transaction.phoneNumber,
    transactionType: transaction.type,
    amount: transaction.amount.toFixed(2),
    description: transaction.description,
    status: 'COMPLETED',
    reference: transaction.id
  };
  
  return {
    success: true,
    receipt
  };
}

// Export the functions
export default {
  PAYBILL_NUMBER,
  getAccountBalance,
  getTransactionHistory,
  topUpAccount,
  buyAirtime,
  payService,
  generateReceipt,
  generateTransactionId
};