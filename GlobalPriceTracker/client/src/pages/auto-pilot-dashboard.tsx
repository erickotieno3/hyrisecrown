import AutoPilotDashboard from "@/components/admin/auto-pilot-dashboard";
import PaybillAdminPanel from "@/components/paybill-admin-panel";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AutoPilotDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage auto-pilot system, commission tracking, and more
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="auto-pilot" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="auto-pilot">Auto-Pilot System</TabsTrigger>
            <TabsTrigger value="paybill">787878 E-Top-Up Commissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto-pilot">
            <Card className="p-6">
              <AutoPilotDashboard />
            </Card>
          </TabsContent>
          
          <TabsContent value="paybill">
            <Card className="p-6">
              <PaybillAdminPanel />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}