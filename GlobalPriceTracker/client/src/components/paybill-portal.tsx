import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, ReceiptText, Printer, Download } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from 'axios';

interface Transaction {
  id: string;
  phoneNumber: string;
  type: 'TOP_UP' | 'AIRTIME_PURCHASE' | 'SERVICE_PAYMENT';
  amount: number;
  description: string;
  date: string;
  paybillNumber: string;
}

interface Receipt {
  receiptNumber: string;
  paybillNumber: string;
  date: string;
  phoneNumber: string;
  transactionType: 'TOP_UP' | 'AIRTIME_PURCHASE' | 'SERVICE_PAYMENT';
  amount: string;
  description: string;
  status: 'COMPLETED' | 'FAILED';
  reference: string;
}

export default function PaybillPortal() {
  const [activeTab, setActiveTab] = useState("top-up");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [reference, setReference] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paybillInfo, setPaybillInfo] = useState<{ paybillNumber: string, name: string, description: string } | null>(null);
  const { toast } = useToast();

  // Load paybill information on component mount
  useEffect(() => {
    fetchPaybillInfo();
  }, []);

  // Check balance and transaction history when phone number changes
  useEffect(() => {
    if (phoneNumber && phoneNumber.length >= 10) {
      fetchBalance();
      fetchTransactions();
    }
  }, [phoneNumber]);

  // Load receipt when transaction is selected
  useEffect(() => {
    if (selectedTransaction) {
      fetchReceipt(selectedTransaction);
    } else {
      setReceipt(null);
    }
  }, [selectedTransaction]);

  // Helper functions for API calls
  const fetchPaybillInfo = async () => {
    try {
      const response = await axios.get('/api/paybill/info');
      if (response.data.success) {
        setPaybillInfo(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch paybill info:', err);
    }
  };

  const fetchBalance = async () => {
    if (!phoneNumber) return;
    
    try {
      const response = await axios.get(`/api/paybill/balance?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      if (response.data.success) {
        setBalance(response.data.balance);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance(null);
    }
  };

  const fetchTransactions = async () => {
    if (!phoneNumber) return;
    
    try {
      const response = await axios.get(`/api/paybill/transactions?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactions([]);
    }
  };

  const fetchReceipt = async (transactionId: string) => {
    try {
      const response = await axios.get(`/api/paybill/receipt/${transactionId}`);
      if (response.data.success) {
        setReceipt(response.data.receipt);
      }
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
      setReceipt(null);
    }
  };

  // Handle form submissions
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !amount) {
      setError('Phone number and amount are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/paybill/topup', {
        phoneNumber,
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        setBalance(response.data.balance);
        setSuccess(response.data.message);
        
        // Get the transaction ID for receipt generation
        const transactionId = response.data.transaction?.id;
        
        toast({
          title: "Account Topped Up!",
          description: `$${amount} added to your account. New balance: $${response.data.balance.toFixed(2)}`,
        });
        
        // Fetch updated transactions immediately
        fetchTransactions();
        
        // Generate receipt if transaction was successful
        if (transactionId) {
          fetchReceipt(transactionId);
          setSelectedTransaction(transactionId);
        }
        
        // Clear the form
        setAmount("");
        
        // Automatically switch to view receipt
        setTimeout(() => {
          setActiveTab("transaction-history");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process top-up');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to process top-up',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAirtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !amount) {
      setError('Phone number and amount are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/paybill/airtime', {
        phoneNumber,
        amount: parseFloat(amount),
        targetNumber: targetNumber || phoneNumber
      });

      if (response.data.success) {
        setBalance(response.data.balance);
        setSuccess(response.data.message);
        
        // Get the transaction ID for receipt generation
        const transactionId = response.data.transaction?.id;
        
        // Show toast notification
        toast({
          title: "Airtime Purchased Successfully!",
          description: `${amount} airtime sent to ${targetNumber || phoneNumber}. Your new balance is $${response.data.balance.toFixed(2)}`,
        });
        
        // Fetch updated transactions immediately
        fetchTransactions();
        
        // Generate receipt if transaction was successful
        if (transactionId) {
          fetchReceipt(transactionId);
          setSelectedTransaction(transactionId);
        }
        
        // Clear the form
        setAmount("");
        if (!targetNumber) setTargetNumber("");
        
        // Automatically switch to view receipt
        setTimeout(() => {
          setActiveTab("transaction-history");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to buy airtime');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to buy airtime',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !amount || !serviceId) {
      setError('Phone number, service ID, and amount are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the correct API endpoint
      const response = await axios.post('/api/paybill/pay-service', {
        phoneNumber,
        serviceId,
        amount: parseFloat(amount),
        reference: reference || null
      });

      if (response.data.success) {
        setBalance(response.data.balance);
        setSuccess(response.data.message);
        
        // Get the transaction ID for receipt generation
        const transactionId = response.data.transaction?.id;
        
        toast({
          title: "Payment Successful!",
          description: `Payment of $${amount} to service ${serviceId} completed. Your new balance is $${response.data.balance.toFixed(2)}`,
        });
        
        // Fetch updated transactions immediately
        fetchTransactions();
        
        // Generate receipt if transaction was successful
        if (transactionId) {
          fetchReceipt(transactionId);
          setSelectedTransaction(transactionId);
        }
        
        // Clear the form
        setAmount("");
        setServiceId("");
        setReference("");
        
        // Automatically switch to view receipt
        setTimeout(() => {
          setActiveTab("transaction-history");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to process payment',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="text-2xl flex items-center">
            <span className="text-3xl font-bold mr-2">{paybillInfo?.paybillNumber || '787878'}</span> E-Top-Up Portal
          </CardTitle>
          <CardDescription className="text-blue-100">
            {paybillInfo?.description || 'Pay for services, buy airtime, and top up your account'}
          </CardDescription>
          <div className="mt-2 text-sm text-blue-100 bg-blue-700 bg-opacity-40 p-2 rounded flex items-center">
            <span className="font-bold mr-1">LOWEST RATES:</span> 
            We offer the most competitive rates in the market - lower than PesaPal and other providers!
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1"
            />
          </div>
          
          {phoneNumber && balance !== null && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="font-semibold">Balance: <span className="text-blue-700">{balance.toFixed(2)}</span></p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="top-up">Top Up</TabsTrigger>
              <TabsTrigger value="buy-airtime">Buy Airtime</TabsTrigger>
              <TabsTrigger value="pay-service">Pay Service</TabsTrigger>
              <TabsTrigger value="check-balance">Check Balance</TabsTrigger>
              <TabsTrigger value="transaction-history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="top-up">
              <form onSubmit={handleTopUp}>
                <div className="mb-4">
                  <Label htmlFor="topUpAmount">Amount</Label>
                  <Input
                    id="topUpAmount"
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !phoneNumber || !amount}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Top Up"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="buy-airtime">
              <form onSubmit={handleBuyAirtime}>
                <div className="mb-4">
                  <Label htmlFor="airtimeAmount">Amount</Label>
                  <Input
                    id="airtimeAmount"
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="targetNumber">Target Number (Optional)</Label>
                  <Input
                    id="targetNumber"
                    placeholder="Leave empty to use your number"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !phoneNumber || !amount}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buy Airtime"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="pay-service">
              <form onSubmit={handlePayService}>
                <div className="mb-4">
                  <Label htmlFor="serviceId">Service ID</Label>
                  <Input
                    id="serviceId"
                    placeholder="Enter service ID"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="serviceAmount">Amount</Label>
                  <Input
                    id="serviceAmount"
                    placeholder="Enter amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="reference">Reference (Optional)</Label>
                  <Input
                    id="reference"
                    placeholder="Enter reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !phoneNumber || !amount || !serviceId}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay Service"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="check-balance">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-lg font-semibold mb-2">Account Balance Inquiry</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your phone number above to check your current balance.
                  </p>
                  
                  {!phoneNumber ? (
                    <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Phone number required</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Please enter your phone number above to check your balance.
                      </AlertDescription>
                    </Alert>
                  ) : loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : balance !== null ? (
                    <div className="bg-white p-6 rounded-md border border-blue-200 text-center">
                      <p className="text-gray-600 mb-2">Your current balance is</p>
                      <p className="text-3xl font-bold text-blue-700">${balance.toFixed(2)}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={fetchBalance}
                      >
                        <span className="mr-2">Refresh</span>
                        <span className="h-4 w-4">↻</span>
                      </Button>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No account found</AlertTitle>
                      <AlertDescription>
                        We couldn't find an account with that phone number. Try topping up first.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-4">
                    * Balance inquiries are free and do not incur any charges.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("top-up")}
                  >
                    Top Up Account
                  </Button>
                  <Button
                    onClick={() => setActiveTab("transaction-history")}
                  >
                    View Transaction History
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transaction-history">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your phone number above to view your transaction history.
                  </p>
                  
                  {!phoneNumber ? (
                    <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Phone number required</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Please enter your phone number above to view your transactions.
                      </AlertDescription>
                    </Alert>
                  ) : loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="bg-white rounded-md border border-gray-200">
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((transaction) => (
                              <TableRow 
                                key={transaction.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => setSelectedTransaction(transaction.id === selectedTransaction ? null : transaction.id)}
                              >
                                <TableCell>{formatDate(transaction.date)}</TableCell>
                                <TableCell>{transaction.type.replace('_', ' ')}</TableCell>
                                <TableCell className={transaction.type === 'TOP_UP' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                  {transaction.type === 'TOP_UP' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {selectedTransaction && receipt && (
                        <div className="p-4 border-t border-dashed border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold flex items-center">
                              <ReceiptText className="h-4 w-4 mr-1" /> Transaction Receipt
                            </h4>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.print()}
                                className="flex items-center text-xs"
                              >
                                <Printer className="h-3 w-3 mr-1" /> Print
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Simulate download receipt functionality
                                  toast({
                                    title: "Receipt Downloaded",
                                    description: "Receipt has been downloaded to your device.",
                                  });
                                }}
                                className="flex items-center text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" /> Download
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-blue-100 rounded-md p-6 relative overflow-hidden">
                            {/* Logo and header */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                              <div className="flex flex-col">
                                <span className="text-xl font-bold text-blue-800">Hyrise Crown</span>
                                <span className="text-sm text-gray-500">E-Top-Up Receipt</span>
                                <span className="text-xs text-gray-400">Registration No. BN-EZC3Z67A</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{receipt.paybillNumber}</div>
                                <div className="text-xs text-gray-500">Paybill Number</div>
                              </div>
                            </div>
                            
                            {/* Status indicator */}
                            <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full ${
                              receipt.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {receipt.status}
                            </div>
                            
                            {/* Receipt details */}
                            <div className="mb-6">
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                  <div className="text-xs text-gray-500">Receipt Number</div>
                                  <div className="font-medium">{receipt.receiptNumber}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Date & Time</div>
                                  <div className="font-medium">{new Date(receipt.date).toLocaleString()}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-gray-500">Phone Number</div>
                                  <div className="font-medium">{receipt.phoneNumber}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Reference</div>
                                  <div className="font-medium">{receipt.reference || "-"}</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Transaction details with highlight */}
                            <div className="bg-blue-50 p-4 rounded-md mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Transaction Type</span>
                                <span className="font-semibold text-blue-800">
                                  {receipt.transactionType.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Amount</span>
                                <span className="font-bold text-lg">
                                  ${receipt.amount}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Description:</span> {receipt.description}
                              </div>
                            </div>
                            
                            {/* Footer with watermark and bank info */}
                            <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500 relative">
                              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <div className="text-6xl font-bold text-blue-900 rotate-45">PAID</div>
                              </div>
                              <div className="mb-2 border-b pb-2">
                                <p className="font-semibold text-gray-600">Merchant Information</p>
                                <p>Hyrise Crown (Registration No. BN-EZC3Z67A)</p>
                                <p>Bank: National Bank Kisumu Kenya | Account: 01521209171200</p>
                              </div>
                              <p>Thank you for using our service. This is an official receipt.</p>
                              <p className="mt-1">For support, please contact our customer service team.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No transactions</AlertTitle>
                      <AlertDescription>
                        You don't have any transactions yet. Start by topping up your account.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchTransactions}
                      disabled={!phoneNumber}
                    >
                      <span className="mr-2">Refresh</span>
                      <span className="h-4 w-4">↻</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("check-balance")}
                  >
                    Check Balance
                  </Button>
                  <Button
                    onClick={() => setActiveTab("top-up")}
                  >
                    Top Up Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Our Competitive Advantage</CardTitle>
          <CardDescription>Why choose our 787878 E-Top-Up service?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border p-4 rounded-md bg-blue-50">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Industry-Leading Low Commission Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Service Type</th>
                      <th className="text-left p-2 border-b">Our Rate</th>
                      <th className="text-left p-2 border-b">PesaPal</th>
                      <th className="text-left p-2 border-b">PayPal</th>
                      <th className="text-left p-2 border-b">Your Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-b">Account Top-Up</td>
                      <td className="p-2 border-b font-bold text-green-600">1.5%</td>
                      <td className="p-2 border-b">2.5-3.5%</td>
                      <td className="p-2 border-b">2.9%+</td>
                      <td className="p-2 border-b text-green-600">Up to 2%</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b">Airtime Purchase</td>
                      <td className="p-2 border-b font-bold text-green-600">2.5%</td>
                      <td className="p-2 border-b">3-4%</td>
                      <td className="p-2 border-b">2.9%+</td>
                      <td className="p-2 border-b text-green-600">Up to 1.5%</td>
                    </tr>
                    <tr>
                      <td className="p-2">Service Payment</td>
                      <td className="p-2 font-bold text-green-600">2%</td>
                      <td className="p-2">1.5-2.5%</td>
                      <td className="p-2">2.9%+</td>
                      <td className="p-2 text-green-600">Up to 0.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                * Rates based on current market research as of May 2025.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border p-4 rounded-md">
                <h4 className="font-semibold mb-2">Fast & Reliable</h4>
                <p className="text-sm text-gray-600">
                  All transactions are processed instantly with real-time confirmations and receipts.
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-semibold mb-2">Secure</h4>
                <p className="text-sm text-gray-600">
                  Your transactions are protected with bank-grade security measures and encryption.
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-semibold mb-2">24/7 Support</h4>
                <p className="text-sm text-gray-600">
                  Contact our customer support team any time for assistance with your transactions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {phoneNumber && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent transactions for {phoneNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedTransaction === transaction.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTransaction(transaction.id === selectedTransaction ? null : transaction.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'TOP_UP' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'TOP_UP' ? '+' : '-'}{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  
                  {selectedTransaction === transaction.id && receipt && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold flex items-center">
                          <ReceiptText className="h-4 w-4 mr-1" /> Receipt
                        </h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {receipt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-500">Receipt Number:</p>
                        <p>{receipt.receiptNumber}</p>
                        
                        <p className="text-gray-500">Date:</p>
                        <p>{receipt.date}</p>
                        
                        <p className="text-gray-500">Amount:</p>
                        <p>{receipt.amount}</p>
                        
                        <p className="text-gray-500">Description:</p>
                        <p>{receipt.description}</p>
                        
                        <p className="text-gray-500">Paybill:</p>
                        <p>{receipt.paybillNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}