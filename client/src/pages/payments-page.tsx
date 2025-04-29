import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, CreditCard, DollarSign, HelpCircle, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import NavHeader from "@/components/nav-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("payment-methods");
  
  // Check if Stripe is properly configured
  const isStripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  // Check for status in URL parameters (e.g., after returning from checkout)
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const status = params.get('status');
    
    if (status === 'success') {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        duration: 5000,
      });
      
      // Remove the status parameter from the URL to prevent showing the message again on refresh
      setLocation('/payments');
    }
  }, [location, toast, setLocation]);
  
  const handleAddPayment = () => {
    if (!isStripeConfigured) {
      toast({
        title: "Stripe not configured",
        description: "The Stripe API keys need to be set up first. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to checkout page for payment
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavHeader />
      
      <main className="flex-1 overflow-auto py-6 px-4">
        <div className="container mx-auto">
          <PageHeader
            title="Payments"
            description="Manage your membership and payment methods"
            breadcrumbs={[{ label: "Payments" }]}
          />
          
          {!isStripeConfigured && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment system not configured</AlertTitle>
              <AlertDescription>
                The Stripe payment system is not yet configured. This is a boilerplate implementation.
                Administrators will need to add Stripe API keys to enable payment processing.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="payment-methods" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="payment-history">Payment History</TabsTrigger>
            </TabsList>
            
            {/* Payment Methods Tab */}
            <TabsContent value="payment-methods" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Add Payment Method Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Add Payment Method</CardTitle>
                    <CardDescription>Add a new credit card or debit card</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-center h-20 text-muted-foreground">
                      <CreditCard className="h-10 w-10" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleAddPayment}>
                      Add Payment Method
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Implementation Notes Card */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Implementation Guide
                    </CardTitle>
                    <CardDescription>For system administrators</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p className="mb-2">To implement Stripe:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Create a Stripe account at stripe.com</li>
                      <li>Add your Stripe API keys to your environment</li>
                      <li>Set <code className="text-xs bg-muted p-1 rounded">VITE_STRIPE_PUBLIC_KEY</code> and <code className="text-xs bg-muted p-1 rounded">STRIPE_SECRET_KEY</code></li>
                      <li>Restart the application</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Membership Tab */}
            <TabsContent value="membership" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Membership</CardTitle>
                  <CardDescription>Manage your membership plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center p-4 rounded-md border">
                    <div>
                      <h3 className="font-medium">BJJ Monthly Membership</h3>
                      <p className="text-sm text-muted-foreground">Unlimited access to all classes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">$99.00</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Billing Information</h3>
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name on Card</Label>
                        <Input id="name" placeholder="John Doe" disabled={!isStripeConfigured} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Billing Address</Label>
                        <Input id="address" placeholder="123 Main St" disabled={!isStripeConfigured} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="New York" disabled={!isStripeConfigured} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="zip">Zip Code</Label>
                          <Input id="zip" placeholder="10001" disabled={!isStripeConfigured} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-renew" defaultChecked disabled={!isStripeConfigured} />
                    <Label htmlFor="auto-renew">Auto-renew subscription</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel Membership</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>Upgrade or change your membership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      {
                        name: "BJJ Monthly",
                        price: "$99/month",
                        description: "Unlimited access to all BJJ classes",
                        features: ["Unlimited classes", "Open mat access", "Basic seminars"]
                      },
                      {
                        name: "Premium Annual",
                        price: "$999/year",
                        description: "Save $189 with annual billing",
                        features: ["All monthly features", "2 private sessions", "Tournament fee coverage"]
                      }
                    ].map((plan, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-2xl font-bold mb-2">{plan.price}</p>
                          <ul className="space-y-1 text-sm">
                            {plan.features.map((feature, j) => (
                              <li key={j} className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" disabled={!isStripeConfigured}>
                            Select Plan
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Payment History Tab */}
            <TabsContent value="payment-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>View your past payments and invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for payment history */}
                  <div className="border rounded-md divide-y">
                    {[
                      { date: "Apr 15, 2025", amount: "$99.00", status: "Paid", type: "Monthly membership" },
                      { date: "Mar 15, 2025", amount: "$99.00", status: "Paid", type: "Monthly membership" },
                      { date: "Feb 15, 2025", amount: "$99.00", status: "Paid", type: "Monthly membership" }
                    ].map((payment, i) => (
                      <div key={i} className="flex justify-between items-center p-4">
                        <div>
                          <p className="font-medium">{payment.type}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {payment.status}
                          </span>
                          <p className="font-medium">{payment.amount}</p>
                          <Button variant="ghost" size="sm">
                            Receipt
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}