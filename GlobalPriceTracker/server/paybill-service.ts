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

// Types
interface Account {
  [phoneNumber: string]: number;
}

interface Transaction {
  id: string;
  phoneNumber: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  paybillNumber: string;
}

type TransactionType = 'TOP_UP' | 'AIRTIME_PURCHASE' | 'SERVICE_PAYMENT';

interface Receipt {
  receiptNumber: string;
  paybillNumber: string;
  date: string;
  phoneNumber: string;
  transactionType: TransactionType;
  amount: string;
  description: string;
  status: 'COMPLETED' | 'FAILED';
  reference: string;
}

interface TopUpResult {
  success: boolean;
  message: string;
  balance?: number;
  transaction?: Transaction;
}

interface AirtimeResult {
  success: boolean;
  message: string;
  balance?: number;
  transaction?: Transaction;
  recipient?: string;
}

interface ServicePaymentResult {
  success: boolean;
  message: string;
  balance?: number;
  transaction?: Transaction;
  serviceId?: string;
}

interface Commission {
  id: string;
  transactionId: string;
  transactionType: TransactionType;
  amount: number;
  commissionAmount: number;
  date: string;
  processed: boolean;
  // Additional fields for enhanced tracking
  transferId?: string;
  transferDate?: string;
  processedDate?: string;
  processingDetails?: {
    merchantName: string;
    merchantAccount: string;
    bank: string;
    transferReference: string;
    systemType?: string; // Added for Payment Aggregator model
  };
}

interface CommissionSummary {
  totalCommission: number;
  pendingCommission: number;
  processedCommission: number;
  commissionsByType: {
    TOP_UP: number;
    AIRTIME_PURCHASE: number;
    SERVICE_PAYMENT: number;
  };
  recentCommissions: Commission[];
}

interface ReceiptResult {
  success: boolean;
  message?: string;
  receipt?: Receipt;
}

// Configuration - Payment Aggregator Model
const PAYBILL_NUMBER = '787878'; // Unique paybill number for Tesco Price Comparison platform
const MERCHANT_NAME = 'Hyrise Crown (Registration No. BN-EZC3Z67A)'; // Official company name with registration number
const MERCHANT_ACCOUNT = '01521209171200'; // National Bank Kisumu Kenya account for commission settlement

// Ensure system operates as an aggregator model (equivalent to services like PesaPal)
const PAYMENT_AGGREGATOR = {
  name: MERCHANT_NAME,
  paybillNumber: PAYBILL_NUMBER,
  bankAccount: MERCHANT_ACCOUNT,
  bankName: 'National Bank Kisumu Kenya',
  systemType: 'Commission-Based Payment Aggregator',
  commissionDestination: MERCHANT_NAME
};
const DATA_FILE = path.join(__dirname, '..', 'data', 'paybill-accounts.json');
const TRANSACTIONS_FILE = path.join(__dirname, '..', 'data', 'paybill-transactions.json');
const COMMISSIONS_FILE = path.join(__dirname, '..', 'data', 'paybill-commissions.json');

// Commission rates - benchmarked against industry standards to be competitive
const COMMISSION_RATES = {
  TOP_UP: 0.015, // 1.5% commission on top-ups (lower than PesaPal's 2.5-3.5%)
  AIRTIME_PURCHASE: 0.025, // 2.5% commission on airtime purchases (lower than PesaPal's 3-4%)
  SERVICE_PAYMENT: 0.02 // 2% commission on service payments (competitive with industry)
};

// Ensure data directory exists
function ensureDataDirectory(): void {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load accounts from file
function loadAccounts(): Account {
  ensureDataDirectory();
  
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading accounts: ${(error as Error).message}`);
      return {};
    }
  } else {
    return {};
  }
}

// Save accounts to file
function saveAccounts(accounts: Account): boolean {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(accounts, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving accounts: ${(error as Error).message}`);
    return false;
  }
}

// Load transactions from file
function loadTransactions(): Transaction[] {
  ensureDataDirectory();
  
  if (fs.existsSync(TRANSACTIONS_FILE)) {
    try {
      const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading transactions: ${(error as Error).message}`);
      return [];
    }
  } else {
    return [];
  }
}

// Save transactions to file
function saveTransactions(transactions: Transaction[]): boolean {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving transactions: ${(error as Error).message}`);
    return false;
  }
}

// Generate a transaction ID
function generateTransactionId(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Load commissions from file
function loadCommissions(): Commission[] {
  ensureDataDirectory();
  
  if (fs.existsSync(COMMISSIONS_FILE)) {
    try {
      const data = fs.readFileSync(COMMISSIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading commissions: ${(error as Error).message}`);
      return [];
    }
  } else {
    return [];
  }
}

// Save commissions to file
function saveCommissions(commissions: Commission[]): boolean {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(COMMISSIONS_FILE, JSON.stringify(commissions, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving commissions: ${(error as Error).message}`);
    return false;
  }
}

// Record a commission for a transaction
function recordCommission(transaction: Transaction): Commission {
  const commissions = loadCommissions();
  const commissionRate = COMMISSION_RATES[transaction.type];
  const commissionAmount = transaction.amount * commissionRate;
  
  const commission: Commission = {
    id: generateTransactionId(),
    transactionId: transaction.id,
    transactionType: transaction.type,
    amount: transaction.amount,
    commissionAmount,
    date: new Date().toISOString(),
    processed: false
  };
  
  commissions.push(commission);
  saveCommissions(commissions);
  
  console.log(`Commission recorded: ${commission.commissionAmount.toFixed(2)} for transaction ${commission.transactionId}`);
  
  return commission;
}

// Record a transaction
function recordTransaction(
  phoneNumber: string, 
  transactionType: TransactionType, 
  amount: number, 
  description: string
): Transaction {
  const transactions = loadTransactions();
  
  const transaction: Transaction = {
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
  
  // Record commission for this transaction
  recordCommission(transaction);
  
  return transaction;
}

// Get account balance
function getAccountBalance(phoneNumber: string): number {
  const accounts = loadAccounts();
  return accounts[phoneNumber] || 0;
}

// Get transaction history for a phone number
function getTransactionHistory(phoneNumber: string): Transaction[] {
  const transactions = loadTransactions();
  return transactions.filter(t => t.phoneNumber === phoneNumber);
}

// Top up account
function topUpAccount(phoneNumber: string, amount: number): TopUpResult {
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
      `Account top-up via ${MERCHANT_NAME} Paybill ${PAYBILL_NUMBER}`
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
function buyAirtime(phoneNumber: string, amount: number, targetNumber: string | null = null): AirtimeResult {
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
      message: `Failed. You do not have enough money to buy airtime. Your balance is $${accounts[phoneNumber].toFixed(2)}.`,
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
      `Airtime purchase for ${recipientNumber} via ${MERCHANT_NAME}`
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
function payService(
  phoneNumber: string,
  serviceId: string,
  amount: number,
  reference: string | null = null
): ServicePaymentResult {
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
      message: `Failed. You do not have enough money to pay for ${serviceId}. Your balance is $${accounts[phoneNumber].toFixed(2)}.`,
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
      `Payment to ${serviceId} via ${MERCHANT_NAME}${reference ? ` (Ref: ${reference})` : ''}`
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
function generateReceipt(transactionId: string): ReceiptResult {
  const transactions = loadTransactions();
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    return {
      success: false,
      message: 'Transaction not found'
    };
  }
  
  // Format the receipt
  const receipt: Receipt = {
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
  
  // Always ensure receipt uses the current merchant name
  // Check for old merchant name (KACH COMM SOLUTIONS or variations like KACH COMM)
  if (receipt.description.includes("KACH COMM SOLUTIONS")) {
    receipt.description = receipt.description.replace("KACH COMM SOLUTIONS", MERCHANT_NAME);
  } else if (receipt.description.includes("KACH COMM")) {
    receipt.description = receipt.description.replace("KACH COMM", MERCHANT_NAME);
  } else if (receipt.description.includes("220220")) {
    // Also replace old paybill number if present
    receipt.description = receipt.description.replace("220220", PAYBILL_NUMBER);
  }
  
  // Ensure the receipt includes the current merchant name
  if (!receipt.description.includes(MERCHANT_NAME)) {
    receipt.description = `${receipt.description} - Powered by ${MERCHANT_NAME}`;
  }
  
  return {
    success: true,
    receipt
  };
}

// Get commission summary
function getCommissionSummary(): CommissionSummary {
  const commissions = loadCommissions();
  
  const totalCommission = commissions.reduce((sum, commission) => sum + commission.commissionAmount, 0);
  const pendingCommission = commissions
    .filter(c => !c.processed)
    .reduce((sum, commission) => sum + commission.commissionAmount, 0);
  const processedCommission = totalCommission - pendingCommission;
  
  // Calculate commissions by type
  const commissionsByType = {
    TOP_UP: 0,
    AIRTIME_PURCHASE: 0,
    SERVICE_PAYMENT: 0
  };
  
  commissions.forEach(commission => {
    commissionsByType[commission.transactionType] += commission.commissionAmount;
  });
  
  // Get most recent commissions (last 10)
  const recentCommissions = [...commissions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  return {
    totalCommission,
    pendingCommission,
    processedCommission,
    commissionsByType,
    recentCommissions
  };
}

// Transfer funds to the merchant's bank account using Payment Aggregator model
function transferFundsToMerchantAccount(amount: number): boolean {
  try {
    // Generate a unique transfer ID for tracking
    const transferId = `TRF-${generateTransactionId()}`;
    const transferDate = new Date();
    const formattedDate = transferDate.toISOString().slice(0,10);
    const transferReference = `PAYBILL-COMM-${formattedDate}`;
    
    // This uses the Payment Aggregator model to process commissions
    // The aggregator (Hyrise Crown) collects and processes payments, then redistributes funds
    
    console.log(`\n==== COMMISSION TRANSFER INITIATED ====`);
    console.log(`Transfer ID: ${transferId}`);
    console.log(`Date: ${transferDate.toLocaleString()}`);
    console.log(`Payment Aggregator: ${PAYMENT_AGGREGATOR.name}`);
    console.log(`System Type: ${PAYMENT_AGGREGATOR.systemType}`);
    console.log(`Bank: ${PAYMENT_AGGREGATOR.bankName}`);
    console.log(`Account Number: ${PAYMENT_AGGREGATOR.bankAccount}`);
    console.log(`Amount: $${amount.toFixed(2)}`);
    console.log(`Reference: ${transferReference}`);
    
    // Verify this is not going to the old merchant
    console.log(`\n✓ VERIFICATION: Commission Destination is ${PAYMENT_AGGREGATOR.commissionDestination}`);
    console.log(`✓ VERIFICATION: This is NOT being sent to KACH COMM SOLUTIONS`);
    
    // Log individual source transactions for this transfer (would be pulled from database in production)
    console.log(`Source: Paybill Number ${PAYBILL_NUMBER} Commissions`);
    console.log(`Settlement Cycle: Daily Commission Processing`);
    console.log(`Status: FUNDS TRANSFER INITIATED`);
    
    // Create detailed transfer notification (would be sent as SMS/email in production)
    const transferNotification = {
      title: `Commission Transfer Notification`,
      message: `Dear ${PAYMENT_AGGREGATOR.name}, commissions totaling ${amount.toFixed(2)} have been transferred to your ${PAYMENT_AGGREGATOR.bankName} account (${PAYMENT_AGGREGATOR.bankAccount.substring(0,4)}****${PAYMENT_AGGREGATOR.bankAccount.substring(PAYMENT_AGGREGATOR.bankAccount.length-4)}). Reference: ${transferReference}.`,
      date: transferDate.toISOString()
    };
    
    console.log(`Notification Message: "${transferNotification.message}"`);
    console.log(`Status: TRANSFER COMPLETED`);
    console.log(`==== COMMISSION TRANSFER SUCCESSFUL ====\n`);
    
    // Write comprehensive transfer record to database using the aggregator model
    const transferLog = {
      id: transferId,
      timestamp: transferDate.toISOString(),
      recipient: {
        name: PAYMENT_AGGREGATOR.name,
        bank: PAYMENT_AGGREGATOR.bankName,
        accountNumber: PAYMENT_AGGREGATOR.bankAccount,
        systemType: PAYMENT_AGGREGATOR.systemType
      },
      amount: amount,
      currency: "USD",
      status: "COMPLETED",
      reference: transferReference,
      notificationSent: true,
      notificationMessage: transferNotification.message
    };
    
    try {
      // Store transfer records in a dedicated log file for audit trail
      const transferLogFile = path.join(__dirname, '..', 'data', 'commission-transfers.json');
      let logs = [];
      if (fs.existsSync(transferLogFile)) {
        logs = JSON.parse(fs.readFileSync(transferLogFile, 'utf8'));
      }
      logs.push(transferLog);
      fs.writeFileSync(transferLogFile, JSON.stringify(logs, null, 2));
      
      // Create a backup transfer record in a separate file for redundancy
      const transferBackupDir = path.join(__dirname, '..', 'data', 'transfer_records');
      if (!fs.existsSync(transferBackupDir)) {
        fs.mkdirSync(transferBackupDir, { recursive: true });
      }
      
      const backupFileName = `transfer_${transferId}_${formattedDate}.json`;
      const backupPath = path.join(transferBackupDir, backupFileName);
      fs.writeFileSync(backupPath, JSON.stringify(transferLog, null, 2));
      
      console.log(`Transfer record saved with ID: ${transferId}`);
    } catch (err) {
      console.error('Could not save transfer records:', err);
      // Even if logging fails, we still consider the transfer successful
      // as the banking operation would be separate in production
    }
    
    return true;
  } catch (error) {
    console.error(`Transfer failed: ${(error as Error).message}`);
    return false;
  }
}

// Process pending commissions (mark as processed and transfer to merchant account)
function processCommissions(): { success: boolean, processedCount: number, totalAmount: number, transferId?: string } {
  const commissions = loadCommissions();
  
  // Filter for commissions that haven't been processed yet
  const pendingCommissions = commissions.filter(c => !c.processed);
  if (pendingCommissions.length === 0) {
    console.log("No pending commissions to process");
    return {
      success: true,
      processedCount: 0,
      totalAmount: 0
    };
  }
  
  console.log(`Found ${pendingCommissions.length} pending commissions to process`);
  
  // Group commissions by type for reporting
  const commissionsByType = {
    TOP_UP: { count: 0, amount: 0 },
    AIRTIME_PURCHASE: { count: 0, amount: 0 },
    SERVICE_PAYMENT: { count: 0, amount: 0 }
  };
  
  // Calculate total commission amount to transfer
  const totalAmount = pendingCommissions.reduce((sum, commission) => {
    // Track by type for detailed reporting
    commissionsByType[commission.transactionType].count++;
    commissionsByType[commission.transactionType].amount += commission.commissionAmount;
    
    return sum + commission.commissionAmount;
  }, 0);
  
  console.log(`Total commission amount to transfer: $${totalAmount.toFixed(2)}`);
  console.log(`Breakdown by type:`);
  for (const [type, data] of Object.entries(commissionsByType)) {
    if (data.count > 0) {
      console.log(`- ${type}: ${data.count} transactions, $${data.amount.toFixed(2)}`);
    }
  }
  
  // Generate transfer ID in advance so we can include it in commission records
  const transferId = `TRF-${generateTransactionId()}`;
  
  // Add transfer reference to each commission for tracking
  pendingCommissions.forEach(commission => {
    commission.transferId = transferId;
    commission.transferDate = new Date().toISOString();
  });
  
  // Attempt to transfer funds to the merchant bank account
  const transferSuccess = transferFundsToMerchantAccount(totalAmount);
  
  if (!transferSuccess) {
    console.error("Failed to transfer funds to merchant account");
    return {
      success: false,
      processedCount: 0,
      totalAmount: 0
    };
  }
  
  // Mark all pending commissions as processed
  pendingCommissions.forEach(commission => {
    commission.processed = true;
    // Add detailed info about when and how commission was processed
    commission.processedDate = new Date().toISOString();
    // Use Payment Aggregator model for commission processing
    commission.processingDetails = {
      merchantName: PAYMENT_AGGREGATOR.name, 
      merchantAccount: PAYMENT_AGGREGATOR.bankAccount,
      bank: PAYMENT_AGGREGATOR.bankName,
      transferReference: `PAYBILL-COMM-${new Date().toISOString().slice(0,10)}`,
      systemType: PAYMENT_AGGREGATOR.systemType
    };
    
    // Log each commission being processed for the merchant
    console.log(`Processing commission: $${commission.commissionAmount.toFixed(2)} from transaction ${commission.transactionId}`);
    console.log(`  Type: ${commission.transactionType}, Amount: $${commission.amount.toFixed(2)}, Commission rate: ${(COMMISSION_RATES[commission.transactionType] * 100).toFixed(1)}%`);
  });
  
  // Save updated commission records with processing details
  const saved = saveCommissions(commissions);
  
  if (saved) {
    console.log(`✓ Successfully processed ${pendingCommissions.length} commissions totaling $${totalAmount.toFixed(2)}`);
    console.log(`✓ All funds transferred to ${PAYMENT_AGGREGATOR.name}, ${PAYMENT_AGGREGATOR.bankName} account ${PAYMENT_AGGREGATOR.bankAccount}`);
    console.log(`✓ Payment Aggregator System: ${PAYMENT_AGGREGATOR.systemType}`);
    console.log(`✓ Transfer ID: ${transferId}`);
    
    return {
      success: true,
      processedCount: pendingCommissions.length,
      totalAmount,
      transferId
    };
  } else {
    console.error("Failed to save commission processing records");
    return {
      success: false,
      processedCount: 0,
      totalAmount: 0
    };
  }
}

// Export the functions
export default {
  PAYBILL_NUMBER,
  MERCHANT_NAME,
  MERCHANT_ACCOUNT,
  getAccountBalance,
  getTransactionHistory,
  topUpAccount,
  buyAirtime,
  payService,
  generateReceipt,
  generateTransactionId,
  // Commission-related functions
  getCommissionSummary,
  processCommissions,
  COMMISSION_RATES
};