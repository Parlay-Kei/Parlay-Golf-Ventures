import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatures } from "@/lib/features";
import { supabase } from "@/lib/supabase";
import { getUserSubscription, createPortalSession, cancelSubscription } from "@/api/stripe-api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, Receipt, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  tier: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  type: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string;
  hosted_invoice_url: string;
  created_at: string;
}

interface Customer {
  id: string;
  stripe_customer_id: string;
  email: string;
}

export default function BillingManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userTier } = useFeatures();
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState("subscription");
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBillingData();
  }, [user, navigate, loadBillingData]);
  
  const loadBillingData = async () => {
    setLoading(true);
    
    try {
      // Load customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Error loading customer data: ${customerError.message}`);
      }
      
      setCustomer(customerData);
      
      // Load subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw new Error(`Error loading subscription data: ${subscriptionError.message}`);
      }
      
      setSubscription(subscriptionData);
      
      // Load payment methods
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });
      
      if (paymentMethodsError) {
        throw new Error(`Error loading payment methods: ${paymentMethodsError.message}`);
      }
      
      setPaymentMethods(paymentMethodsData || []);
      
      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (invoicesError) {
        throw new Error(`Error loading invoices: ${invoicesError.message}`);
      }
      
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error loading billing data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleManagePaymentMethods = async () => {
    if (!customer) {
      toast({
        title: "No customer record found",
        description: "Please subscribe to a plan first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const portalUrl = await createPortalSession(customer.stripe_customer_id);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Error opening customer portal",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setCancelingSubscription(true);
    
    try {
      await cancelSubscription(subscription.stripe_subscription_id);
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled and will end at the current billing period",
      });
      
      // Reload subscription data
      loadBillingData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error canceling subscription",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setCancelingSubscription(false);
    }
  };
  
  const formatCurrency = (amount: number, currency: string = 'usd') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount / 100);
  };
  
  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500">Canceled</Badge>;
      case 'incomplete':
        return <Badge className="bg-yellow-500">Incomplete</Badge>;
      case 'incomplete_expired':
        return <Badge className="bg-red-500">Expired</Badge>;
      case 'past_due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500">Unpaid</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'driven':
        return <Badge className="bg-purple-500">Driven</Badge>;
      case 'aspiring':
        return <Badge className="bg-pgv-green">Aspiring</Badge>;
      case 'breakthrough':
        return <Badge className="bg-pgv-gold text-pgv-green">Breakthrough</Badge>;
      default:
        return <Badge className="bg-blue-500">Free</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-pgv-green mx-auto mb-4" />
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Billing Management</h1>
            <p className="text-muted-foreground">Manage your subscription, payment methods, and billing history</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="invoices">Billing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Manage your current subscription plan and billing cycle
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {subscription ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium capitalize">{subscription.tier} Plan</h3>
                            {getTierBadge(subscription.tier)}
                            {getStatusBadge(subscription.status)}
                          </div>
                          
                          {subscription.cancel_at_period_end && (
                            <div className="flex items-center text-amber-600 gap-2 text-sm mt-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Your subscription will end on {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                        
                        {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                          <Button 
                            variant="outline" 
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={handleCancelSubscription}
                            disabled={cancelingSubscription}
                          >
                            {cancelingSubscription ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Canceling...
                              </>
                            ) : (
                              'Cancel Subscription'
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Billing Cycle</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-pgv-green" />
                              <span className="text-sm">Current period started: {format(new Date(subscription.current_period_start), 'MMMM d, yyyy')}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-pgv-green" />
                              <span className="text-sm">Current period ends: {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}</span>
                            </div>
                            
                            {subscription.canceled_at && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Canceled on: {format(new Date(subscription.canceled_at), 'MMMM d, yyyy')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Payment Details</h4>
                          {paymentMethods.length > 0 ? (
                            <div className="space-y-2">
                              {paymentMethods.map(method => (
                                <div key={method.id} className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-pgv-green" />
                                  <span className="text-sm">
                                    {method.type === 'card' ? 'Card' : method.type} ending in {method.last_four}
                                    {method.is_default && (
                                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No payment methods found</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <CreditCard className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                      <p className="text-muted-foreground mb-4">You don't have an active subscription plan</p>
                      <Button onClick={() => navigate('/subscription-new')} className="bg-pgv-green hover:bg-pgv-green/90">
                        View Subscription Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </Button>
                  
                  {subscription && subscription.status === 'active' && (
                    <Button onClick={() => navigate('/subscription-new')}>
                      Change Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your saved payment methods and update billing information
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {customer ? (
                    <div>
                      {paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                          {paymentMethods.map(method => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-md">
                                  <CreditCard className="h-5 w-5 text-gray-700" />
                                </div>
                                
                                <div>
                                  <div className="font-medium capitalize">
                                    {method.type === 'card' ? 'Credit Card' : method.type}
                                    {method.is_default && (
                                      <Badge className="ml-2 bg-pgv-green">Default</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    •••• {method.last_four} | Expires {method.exp_month}/{method.exp_year}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <CreditCard className="h-6 w-6 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                          <p className="text-muted-foreground mb-4">You don't have any saved payment methods</p>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <Button 
                          onClick={handleManagePaymentMethods}
                          className="w-full md:w-auto"
                        >
                          Manage Payment Methods
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <CreditCard className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Customer Record</h3>
                      <p className="text-muted-foreground mb-4">You need to subscribe to a plan first</p>
                      <Button onClick={() => navigate('/subscription-new')} className="bg-pgv-green hover:bg-pgv-green/90">
                        View Subscription Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invoices" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View your past invoices and payment history
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {invoices.length > 0 ? (
                    <div className="space-y-4">
                      {invoices.map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <Receipt className="h-5 w-5 text-gray-700" />
                            </div>
                            
                            <div>
                              <div className="font-medium">
                                Invoice {formatCurrency(invoice.amount_due, invoice.currency)}
                                {invoice.status === 'paid' && (
                                  <Badge className="ml-2 bg-green-500">Paid</Badge>
                                )}
                                {invoice.status === 'open' && (
                                  <Badge className="ml-2 bg-yellow-500">Unpaid</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(invoice.created_at), 'MMMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            {invoice.hosted_invoice_url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                              >
                                View
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        <Receipt className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Billing History</h3>
                      <p className="text-muted-foreground">You don't have any invoices yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
