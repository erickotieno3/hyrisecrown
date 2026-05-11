import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const leadFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
  interest: z.string(),
  message: z.string().optional(),
  subscribe: z.boolean().default(true),
  source: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadCaptureFormProps {
  title?: string;
  description?: string;
  formPosition?: 'left' | 'right' | 'center';
  darkMode?: boolean;
  leadSource?: string;
  successCallback?: () => void;
  interestOptions?: { value: string; label: string }[];
}

export function LeadCaptureForm({
  title = "Get in Touch",
  description = "Fill out the form below to learn more about our price comparison services",
  formPosition = 'center',
  darkMode = false,
  leadSource = 'website',
  successCallback,
  interestOptions = [
    { value: 'comparison_shopping', label: 'Price Comparison' },
    { value: 'visual_search', label: 'Visual Search' },
    { value: 'affiliate_program', label: 'Affiliate Program' },
    { value: 'vendor_partnership', label: 'Vendor Partnership' },
    { value: 'other', label: 'Other' }
  ],
}: LeadCaptureFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      company: '',
      interest: 'comparison_shopping',
      message: '',
      subscribe: true,
      source: leadSource,
    },
  });
  
  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would send data to your API
      // const response = await fetch('/api/leads', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // if (!response.ok) throw new Error('Failed to submit form');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Lead captured:', data);
      
      toast({
        title: 'Form submitted successfully',
        description: 'We will get back to you soon!',
      });
      
      reset();
      
      if (successCallback) {
        successCallback();
      }
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'There was a problem submitting your form. Please try again.',
        variant: 'destructive',
      });
      console.error('Error submitting lead form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formPositionClass = 
    formPosition === 'left' 
      ? 'mr-auto' 
      : formPosition === 'right' 
        ? 'ml-auto' 
        : 'mx-auto';
  
  const themeClass = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
  
  return (
    <Card className={`w-full max-w-md ${formPositionClass} ${themeClass} shadow-lg`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Your full name"
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} ${errors.fullName ? 'border-red-500' : ''}`}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your.email@example.com"
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="+1 234 567 8900"
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Your company name"
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest">What are you interested in? <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue="comparison_shopping"
              onValueChange={(value) => setValue('interest', value)}
            >
              <SelectTrigger 
                id="interest"
                className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
              >
                <SelectValue placeholder="Select an interest" />
              </SelectTrigger>
              <SelectContent>
                {interestOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell us more about your needs..."
              className={darkMode ? 'bg-gray-800 border-gray-700' : ''}
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="subscribe" 
              checked={true} 
              onCheckedChange={(checked) => setValue('subscribe', checked)}
              className={darkMode ? '' : ''}
            />
            <Label htmlFor="subscribe" className="text-sm">
              Subscribe to our newsletter for exclusive offers and updates
            </Label>
          </div>
          
          <input type="hidden" {...register('source')} value={leadSource} />
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}