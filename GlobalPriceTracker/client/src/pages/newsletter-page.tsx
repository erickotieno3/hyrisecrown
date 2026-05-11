import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertNewsletterSubscriberSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail } from "lucide-react";

// Extend the schema with more validation
const formSchema = insertNewsletterSubscriberSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewsletterPage() {
  const { t, i18n } = useTranslation("newsletter");
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      language: i18n.language,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed to the newsletter!",
        duration: 3000,
      });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Failed to subscribe to the newsletter. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      ...data,
      language: i18n.language,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Tesco logo */}
      <header className="bg-[#6AAA84] py-4 px-6 flex justify-between items-center">
        <div className="font-bold text-2xl text-black">
          tesco
        </div>
        <Mail className="h-6 w-6 text-white" />
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center p-6 bg-white">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold mb-2">Sign Up for Our Newsletter</h1>
          <p className="text-gray-700 mb-8">
            Subscribe to receive the latest deals and updates from the app.
          </p>
          
          {/* Newsletter Icon */}
          <div className="w-32 h-32 mx-auto mb-8">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-full h-full stroke-2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" />
              <path d="M2 7L12 14L22 7" stroke="currentColor" />
              <line x1="6" y1="11" x2="12" y2="11" stroke="currentColor" />
              <line x1="6" y1="14" x2="10" y2="14" stroke="currentColor" />
            </svg>
          </div>
          
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Email address" 
                          className="py-4 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6AAA84] focus:border-transparent text-dark w-full"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1 text-left" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-[#6AAA84] hover:bg-[#5c9975] text-white font-bold py-4 px-8 rounded-lg transition"
                  disabled={mutation.isPending}
                >
                  Subscribe
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center mb-6">
              <p className="text-green-600 font-medium">Successfully subscribed to the newsletter!</p>
            </div>
          )}
          
          <div className="mt-8 space-y-4">
            <Link href="/compare">
              <button className="block w-full text-[#333333] font-medium">
                Start comparing prices
              </button>
            </Link>
            <Link href="/">
              <button className="block w-full text-gray-500">
                Skip
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}