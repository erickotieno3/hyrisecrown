import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BannerAdSpace from '@/components/advertising/BannerAdSpace';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

// Define the form schema
const adPurchaseSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(8, 'Valid phone number is required'),
  bannerSize: z.enum(['small', 'medium', 'large', 'leaderboard']),
  bannerPosition: z.enum(['top', 'sidebar', 'inline', 'footer']),
  duration: z.enum(['1-week', '2-weeks', '1-month', '3-months', '6-months', '1-year']),
  bannerUrl: z.string().url('Valid URL is required'),
  requirements: z.string().min(10, 'Please describe your requirements').max(500, 'Maximum 500 characters'),
});

type AdPurchaseFormValues = z.infer<typeof adPurchaseSchema>;

const AdvertisePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Default form values
  const defaultValues: Partial<AdPurchaseFormValues> = {
    bannerSize: 'medium',
    bannerPosition: 'sidebar',
    duration: '1-month',
  };
  
  // Initialize form
  const form = useForm<AdPurchaseFormValues>({
    resolver: zodResolver(adPurchaseSchema),
    defaultValues,
  });
  
  // Handle form submission
  const onSubmit = async (data: AdPurchaseFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In production, this would make an API call to process the request
      console.log('Advertisement purchase request:', data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: "Advertising Request Received",
        description: "Our team will contact you within 24 hours to discuss your advertising needs.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Pricing information
  const pricingDetails = {
    small: {
      "1-week": "£99",
      "2-weeks": "£179",
      "1-month": "£299",
      "3-months": "£799",
      "6-months": "£1,499",
      "1-year": "£2,799",
    },
    medium: {
      "1-week": "£149",
      "2-weeks": "£279",
      "1-month": "£499",
      "3-months": "£1,299",
      "6-months": "£2,499",
      "1-year": "£4,499",
    },
    large: {
      "1-week": "£199",
      "2-weeks": "£379",
      "1-month": "£699",
      "3-months": "£1,899",
      "6-months": "£3,499",
      "1-year": "£6,299",
    },
    leaderboard: {
      "1-week": "£249",
      "2-weeks": "£459",
      "1-month": "£799",
      "3-months": "£2,199",
      "6-months": "£3,999",
      "1-year": "£7,299",
    },
  };
  
  // Get current price based on form values
  const getCurrentPrice = () => {
    const size = form.watch('bannerSize') || 'medium';
    const duration = form.watch('duration') || '1-month';
    return pricingDetails[size as keyof typeof pricingDetails][duration as keyof typeof pricingDetails[typeof size]];
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Advertise with Us</h1>
        <p className="text-muted-foreground mb-8">
          Reach millions of price-conscious shoppers across multiple countries
        </p>
        
        {isSuccess ? (
          <Card className="mx-auto max-w-3xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank You for Your Interest!</h2>
              <p className="mb-6">
                Your advertising request has been received. Our team will contact you within 24 hours at{' '}
                <strong>{form.getValues('contactEmail')}</strong> to discuss your requirements and next steps.
              </p>
              <div className="bg-muted p-4 rounded-lg inline-block mb-6">
                <p className="font-medium">Reference: AD-{Date.now().toString().slice(-8)}</p>
              </div>
              <Button onClick={() => setIsSuccess(false)}>Submit Another Request</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Advertising Space</CardTitle>
                  <CardDescription>
                    Fill out the form below to request advertising space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Company Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Company Information</h3>
                        
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="contactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {/* Banner Options */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Banner Options</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="bannerSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banner Size</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select banner size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="small">Small (300x100)</SelectItem>
                                    <SelectItem value="medium">Medium (300x250)</SelectItem>
                                    <SelectItem value="large">Large (300x600)</SelectItem>
                                    <SelectItem value="leaderboard">Leaderboard (728x90)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bannerPosition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banner Position</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="top">Top of Page</SelectItem>
                                    <SelectItem value="sidebar">Sidebar</SelectItem>
                                    <SelectItem value="inline">Inline (Between Content)</SelectItem>
                                    <SelectItem value="footer">Footer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Duration</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-week">1 Week</SelectItem>
                                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                                  <SelectItem value="1-month">1 Month</SelectItem>
                                  <SelectItem value="3-months">3 Months</SelectItem>
                                  <SelectItem value="6-months">6 Months</SelectItem>
                                  <SelectItem value="1-year">1 Year</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bannerUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://your-company.com/landing-page" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Additional Requirements */}
                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Requirements</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe any special requirements for your banner ad..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Request Ad Space'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-5">
              {/* Preview and Pricing */}
              <div className="space-y-6 sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Banner Preview</CardTitle>
                    <CardDescription>
                      How your banner space will appear
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <BannerAdSpace
                      id="preview"
                      size={form.watch('bannerSize') as any || 'medium'}
                      position={form.watch('bannerPosition') as any || 'sidebar'}
                      isAvailable={true}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                    <CardDescription>
                      Current selection: {getCurrentPrice()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2 font-medium">Duration</th>
                          <th className="text-right pb-2 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(pricingDetails[form.watch('bannerSize') as keyof typeof pricingDetails || 'medium']).map(([duration, price]) => (
                          <tr key={duration} className="border-b">
                            <td className="py-2">{duration.replace('-', ' ')}</td>
                            <td className="py-2 text-right font-medium">{price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">All advertising prices include:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>Ad serving across all countries</li>
                        <li>Detailed performance analytics</li>
                        <li>A/B testing capability</li>
                        <li>Audience targeting options</li>
                        <li>One free design revision</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdvertisePage;