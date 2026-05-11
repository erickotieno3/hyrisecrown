import React from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function LegalDocumentsPage() {
  return (
    <Container className="py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Legal Information</h1>
          <p className="text-muted-foreground">
            Terms, privacy policy, and copyright notices
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="copyright">Copyright</TabsTrigger>
          <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>TERMS OF SERVICE</h2>
              <p className="text-sm text-muted-foreground">Last Updated: May 19, 2025</p>
              
              <h3>1. ACCEPTANCE OF TERMS</h3>
              <p>
                By accessing and using the Tesco Price Comparison Platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
              
              <h3>2. DESCRIPTION OF SERVICE</h3>
              <p>
                The Service is designed to provide price comparison information for products across multiple retailers and marketplaces. It includes features such as price tracking, visual search, and other shopping assistance tools.
              </p>
              
              <h3>3. USER ACCOUNTS</h3>
              <p>
                Some features of the Service may require you to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
              
              <h3>4. USER CONDUCT</h3>
              <p>
                When using the Service, you agree not to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Interfere with or disrupt the integrity of the Service</li>
              </ul>
              
              <h3>5. COPYRIGHT AND CONTENT</h3>
              <p>
                All content comparison data is provided for informational purposes only. Product names, images, and descriptions are owned by their respective brands. We collect and display this information under fair use principles for the purpose of price comparison.
              </p>
              
              <h3>6. THIRD-PARTY CONTENT AND SERVICES</h3>
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled by Hyrise Crown. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              
              <h3>7. LIMITATION OF LIABILITY</h3>
              <p>
                The Service is provided "as is" without warranties of any kind. We are not responsible for the accuracy of prices or product information. In no event shall Hyrise Crown be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
              
              <h3>8. CHANGES TO TERMS</h3>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the Service after such changes constitutes your acceptance of the new terms.
              </p>
              
              <h3>9. GOVERNING LAW</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
              </p>
              
              <h3>10. CONTACT US</h3>
              <p>
                If you have any questions about these Terms, please contact us at erickotienokjv@gmail.com.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>PRIVACY POLICY</h2>
              <p className="text-sm text-muted-foreground">Last Updated: May 19, 2025</p>
              
              <h3>1. INTRODUCTION</h3>
              <p>
                At Hyrise Crown, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Tesco Price Comparison Platform.
              </p>
              
              <h3>2. DATA COLLECTION</h3>
              <p>
                We collect information necessary to provide our price comparison service, including:
              </p>
              <ul>
                <li>Personal Information: Name, email address, and account credentials when you register</li>
                <li>Usage Data: Search queries, browsing behavior, and device information</li>
                <li>Technical Data: IP address, browser type, device type, and operating system</li>
                <li>User Content: Any images uploaded for visual search features</li>
              </ul>
              
              <h3>3. USE OF DATA</h3>
              <p>
                We use your data for the following purposes:
              </p>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To personalize your shopping experience</li>
                <li>To improve our products and services</li>
                <li>To communicate with you about updates or changes</li>
                <li>To detect and prevent fraudulent activities</li>
              </ul>
              
              <h3>4. AI PROCESSING</h3>
              <p>
                User inputs may be processed by our AI systems powered by OpenAI's models. We implement safeguards to protect user privacy during AI processing. Any images you upload for visual search are processed only for the purpose of finding similar products.
              </p>
              
              <h3>5. DATA SHARING</h3>
              <p>
                We do not sell your personal information to third parties. Limited data may be shared with:
              </p>
              <ul>
                <li>Service providers who help us operate our platform</li>
                <li>Analytics partners to improve our Service</li>
                <li>Legal authorities when required by law</li>
              </ul>
              
              <h3>6. DATA SECURITY</h3>
              <p>
                We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h3>7. DATA RETENTION</h3>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              
              <h3>8. YOUR RIGHTS</h3>
              <p>
                Depending on your location, you may have the right to:
              </p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
              
              <h3>9. CHANGES TO THIS POLICY</h3>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
              
              <h3>10. CONTACT US</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at erickotienokjv@gmail.com.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="copyright" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Copyright Notice</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>COPYRIGHT NOTICE</h2>
              <p className="text-sm text-muted-foreground">Last Updated: May 19, 2025</p>
              
              <h3>1. COPYRIGHT STATEMENT</h3>
              <p>
                © 2025 Hyrise Crown. All rights reserved.
              </p>
              <p>
                The content, organization, graphics, design, compilation, and other matters related to the Tesco Price Comparison Platform are protected under applicable copyrights, trademarks, and other proprietary rights. Copying, redistribution, use, or publication by you of any such matters or any part of the Service is strictly prohibited without our express prior written permission.
              </p>
              
              <h3>2. TRADEMARK NOTICE</h3>
              <p>
                Product names, logos, brands, and other trademarks featured or referred to within the Tesco Price Comparison Platform are the property of their respective trademark holders. These trademark holders are not affiliated with, nor do they sponsor or endorse, our service.
              </p>
              <p>
                "Tesco" is a registered trademark of Tesco PLC. Our use of the Tesco name is for descriptive and comparative purposes only, indicating that we compare prices of products available at Tesco stores.
              </p>
              
              <h3>3. FAIR USE DISCLAIMER</h3>
              <p>
                We display product information, including names, images, and descriptions, under fair use principles for the purpose of comparative information. Our use is transformative and provides valuable consumer information by comparing prices across different retailers.
              </p>
              
              <h3>4. CONTENT RIGHTS</h3>
              <p>
                You may not copy, reproduce, distribute, publish, display, perform, modify, create derivative works, transmit, or in any way exploit any part of our service without our written permission. You may download or copy content for your personal, non-commercial use only, provided that you maintain all copyright and other notices contained in such content.
              </p>
              
              <h3>5. USER CONTENT</h3>
              <p>
                By submitting content to our platform (including reviews, comments, or images), you grant us a non-exclusive, royalty-free, perpetual, irrevocable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media.
              </p>
              
              <h3>6. AI MODEL ATTRIBUTION</h3>
              <p>
                Our service utilizes OpenAI's GPT-4o and other models. Usage complies with OpenAI's terms of service. All AI-generated content is reviewed by humans before publication.
              </p>
              
              <h3>7. INFRINGEMENT CLAIMS</h3>
              <p>
                If you believe that your work has been copied in a way that constitutes copyright infringement, please provide us with the following information:
              </p>
              <ul>
                <li>A description of the copyrighted work that you claim has been infringed</li>
                <li>A description of where the material you claim is infringing is located on the site</li>
                <li>Your contact information</li>
                <li>A statement that you have a good faith belief that the disputed use is not authorized</li>
                <li>A statement, made under penalty of perjury, that the above information is accurate</li>
              </ul>
              
              <h3>8. CONTACT FOR COPYRIGHT MATTERS</h3>
              <p>
                Please send copyright notices or inquiries to: erickotienokjv@gmail.com
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="disclaimer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h2>DISCLAIMER</h2>
              <p className="text-sm text-muted-foreground">Last Updated: May 19, 2025</p>
              
              <h3>1. ACCURACY OF INFORMATION</h3>
              <p>
                The prices, product information, and images displayed on this platform are collected from various sources and may not always be up-to-date or accurate. We make no representations or warranties about the accuracy, completeness, or reliability of any information provided. Users should verify all information before making purchasing decisions.
              </p>
              
              <h3>2. NOT AFFILIATED WITH RETAILERS</h3>
              <p>
                Hyrise Crown and the Tesco Price Comparison Platform are not affiliated with, endorsed by, or sponsored by any of the retailers mentioned on our platform, including Tesco, Walmart, Amazon, eBay, AliExpress, Jumia, Kilimall, or Shopify stores. We operate independently as a price comparison service.
              </p>
              
              <h3>3. NO FINANCIAL ADVICE</h3>
              <p>
                Content related to savings, financial milestones, or shopping strategies should not be considered financial advice. Our platform provides tools for comparison shopping, but users should consult qualified financial advisors for personal financial decisions.
              </p>
              
              <h3>4. AI-GENERATED CONTENT</h3>
              <p>
                Portions of our content may be assisted or generated by artificial intelligence technology. While we strive for accuracy, AI-generated content may contain errors or inconsistencies. We review AI-generated content but cannot guarantee its complete accuracy.
              </p>
              
              <h3>5. VISUAL SEARCH LIMITATIONS</h3>
              <p>
                Our visual search feature uses AI to identify similar products based on images. Results are provided on a best-effort basis and may not always accurately identify products or find the exact matches. The feature is provided for convenience and should not be relied upon for critical decisions.
              </p>
              
              <h3>6. THIRD-PARTY LINKS</h3>
              <p>
                Our platform may contain links to third-party websites or services. We are not responsible for the content or privacy practices of these sites. Users access third-party sites at their own risk.
              </p>
              
              <h3>7. LIMITATION OF LIABILITY</h3>
              <p>
                In no event shall Hyrise Crown, its officers, directors, employees, or agents be liable for any indirect, punitive, incidental, special, or consequential damages arising out of, or in any way connected with, your use of this service, whether based on contract, tort, strict liability, or otherwise.
              </p>
              
              <h3>8. AVAILABILITY OF SERVICE</h3>
              <p>
                We do not guarantee that our service will be available at all times. We reserve the right to suspend or terminate the service temporarily or permanently at any time without notice.
              </p>
              
              <h3>9. USER RESPONSIBILITY</h3>
              <p>
                Users are responsible for their own actions when using information from our platform to make purchasing decisions. We recommend comparing prices and information from multiple sources before making significant purchases.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}