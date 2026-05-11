import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { Edit, Save } from 'lucide-react';

interface Commission {
  id: string;
  transactionId: string;
  transactionType: 'TOP_UP' | 'AIRTIME_PURCHASE' | 'SERVICE_PAYMENT';
  amount: number;
  commissionAmount: number;
  date: string;
  processed: boolean;
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

interface PaymentDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  mobileNumber: string;
  preferredMethod: "bank" | "mobile";
}

export default function PaybillAdminPanel() {
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCommissions, setProcessingCommissions] = useState(false);
  const { toast } = useToast();
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    accountName: "Hyrise Crown",
    accountNumber: "01521209171200",
    bankName: "Standard Bank",
    mobileNumber: "",
    preferredMethod: "bank"
  });
  
  const [isEditingPaymentDetails, setIsEditingPaymentDetails] = useState(false);
  
  useEffect(() => {
    fetchCommissionSummary();
    
    // Load payment details
    const savedDetails = localStorage.getItem('paymentDetails');
    if (savedDetails) {
      try {
        setPaymentDetails(JSON.parse(savedDetails));
      } catch (e) {
        console.error('Error parsing payment details:', e);
      }
    }
  }, []);

  const fetchCommissionSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/paybill/admin/commissions', {
        headers: {
          'x-admin-token': 'ADMIN_SECURE_TOKEN' // In production, this would be a secure token
        }
      });
      
      if (response.data.success) {
        setSummary(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch commission data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching commission summary:', error);
      toast({
        title: "Error",
        description: "Failed to fetch commission data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const processCommissions = async () => {
    setProcessingCommissions(true);
    try {
      const response = await axios.post('/api/paybill/admin/process-commissions', {}, {
        headers: {
          'x-admin-token': 'ADMIN_SECURE_TOKEN' // In production, this would be a secure token
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        
        // Refresh the summary after processing
        fetchCommissionSummary();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to process commissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing commissions:', error);
      toast({
        title: "Error",
        description: "Failed to process commissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingCommissions(false);
    }
  };
  
  const savePaymentDetails = () => {
    // Validate payment details
    if (paymentDetails.preferredMethod === "bank") {
      if (!paymentDetails.accountName || !paymentDetails.accountNumber || !paymentDetails.bankName) {
        toast({
          title: "Missing information",
          description: "Please fill in all bank account details",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!paymentDetails.mobileNumber) {
        toast({
          title: "Missing information",
          description: "Please enter a mobile number",
          variant: "destructive",
        });
        return;
      }
    }
    
    // In a real implementation, this would save to your backend API
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
    setIsEditingPaymentDetails(false);
    toast({
      title: "Payment details saved",
      description: "Your commission withdrawal details have been updated",
    });
  };
  
  const handlePaymentMethodChange = (value: "bank" | "mobile") => {
    setPaymentDetails(prev => ({ ...prev, preferredMethod: value }));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'TOP_UP':
        return 'Top-Up';
      case 'AIRTIME_PURCHASE':
        return 'Airtime Purchase';
      case 'SERVICE_PAYMENT':
        return 'Service Payment';
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>787878 E-Top-Up Commission Summary</CardTitle>
          <CardDescription>
            Overview of all commissions earned from E-Top-Up service transactions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 mb-1">Total Commission</div>
              <div className="text-2xl font-bold text-blue-700">${summary?.totalCommission.toFixed(2) || '0.00'}</div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <div className="text-sm text-amber-600 mb-1">Pending Commission</div>
              <div className="text-2xl font-bold text-amber-700">${summary?.pendingCommission.toFixed(2) || '0.00'}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 mb-1">Processed Commission</div>
              <div className="text-2xl font-bold text-green-700">${summary?.processedCommission.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Commission by Transaction Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Top-Up</div>
              <div className="text-xl font-semibold">${summary?.commissionsByType?.TOP_UP.toFixed(2) || '0.00'}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Airtime Purchase</div>
              <div className="text-xl font-semibold">${summary?.commissionsByType?.AIRTIME_PURCHASE.toFixed(2) || '0.00'}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Service Payment</div>
              <div className="text-xl font-semibold">${summary?.commissionsByType?.SERVICE_PAYMENT.toFixed(2) || '0.00'}</div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Recent Commission Transactions</h3>
          <Table>
            <TableCaption>Recent transactions from 787878 E-Top-Up service</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.recentCommissions?.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>{new Date(commission.date).toLocaleString()}</TableCell>
                  <TableCell>{getTransactionTypeLabel(commission.transactionType)}</TableCell>
                  <TableCell>${commission.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${commission.commissionAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {commission.processed ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Processed</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {(!summary?.recentCommissions || summary.recentCommissions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No commission transactions recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchCommissionSummary}>Refresh Data</Button>
          <Button 
            onClick={processCommissions}
            disabled={processingCommissions || !summary?.pendingCommission || summary.pendingCommission <= 0}
          >
            {processingCommissions ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </>
            ) : (
              'Process Pending Commissions'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Payment Details Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Withdrawal Details</CardTitle>
              <CardDescription>
                Specify where you want your processed commissions to be sent
              </CardDescription>
            </div>
            {!isEditingPaymentDetails && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingPaymentDetails(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditingPaymentDetails ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Choose your preferred payment method:</p>
                <RadioGroup 
                  value={paymentDetails.preferredMethod}
                  onValueChange={(value) => handlePaymentMethodChange(value as "bank" | "mobile")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank Account</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile Money</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {paymentDetails.preferredMethod === "bank" ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={paymentDetails.bankName}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="Enter your bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input
                      id="accountName"
                      value={paymentDetails.accountName}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={paymentDetails.accountNumber}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="mobileNumber">Mobile Money Number</Label>
                  <Input
                    id="mobileNumber"
                    value={paymentDetails.mobileNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="Enter mobile money number"
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingPaymentDetails(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={savePaymentDetails}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Details
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {paymentDetails.preferredMethod === "bank" && (paymentDetails.accountName || paymentDetails.accountNumber || paymentDetails.bankName) ? (
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-semibold mb-3">Bank Account Details</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <p className="text-sm text-gray-500">Bank Name:</p>
                      <p className="text-sm col-span-2">{paymentDetails.bankName || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="text-sm text-gray-500">Account Name:</p>
                      <p className="text-sm col-span-2">{paymentDetails.accountName || "Not specified"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="text-sm text-gray-500">Account Number:</p>
                      <p className="text-sm col-span-2">{paymentDetails.accountNumber || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              ) : paymentDetails.preferredMethod === "mobile" && paymentDetails.mobileNumber ? (
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-semibold mb-3">Mobile Money Details</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <p className="text-sm text-gray-500">Mobile Number:</p>
                    <p className="text-sm col-span-2">{paymentDetails.mobileNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No payment details specified yet. Click "Edit Details" to add your withdrawal information.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">About Commission Processing</h3>
        <p className="text-sm text-blue-700 mb-2">
          All commissions from the 787878 E-Top-Up service are automatically tracked and credited to your account.
          The "Process Pending Commissions" button transfers pending commissions to your account for withdrawal.
        </p>
        <p className="text-sm text-blue-700">
          <strong>Commission Rates:</strong> Top-Up (1.5%), Airtime Purchase (2.5%), Service Payment (2%)
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <strong>Note:</strong> Rates are benchmarked to be lower than PesaPal and other competitors to attract more clients.
        </p>
      </div>
    </div>
  );
}