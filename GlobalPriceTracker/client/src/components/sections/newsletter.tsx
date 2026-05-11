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

// Extend the schema with more validation
const formSchema = insertNewsletterSubscriberSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Newsletter() {
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
        title: t("success"),
        duration: 3000,
      });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: t("error"),
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
    <section className="py-10 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-inter font-semibold text-2xl md:text-3xl mb-4">
            {t("title")}
          </h2>
          <p className="mb-6">
            {t("description")}
          </p>
          
          {!isSubmitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input 
                          placeholder={t("placeholder")} 
                          className="py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-dark w-full" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-yellow-200 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="bg-accent hover:bg-opacity-90 text-white font-medium py-3 px-8 rounded-md transition sm:w-auto"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t("common:loading") : t("subscribe")}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="bg-white/10 rounded-md py-4 px-6">
              <p>{t("success")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
