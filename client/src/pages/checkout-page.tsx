import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '@/lib/stripe-service';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CheckoutForm = ({ onPaymentSuccess }: { onPaymentSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Use confirmPayment to handle the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payments?status=success',
      },
    });

    setIsProcessing(false);

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      toast({
        title: 'Payment Failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } else {
      // The payment has succeeded and the result will be handled by the return_url
      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
      });
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Mock amount for demonstration - in a real app, you'd get this from previous page or URL params
  const amount = 99;
  const currency = 'usd';

  useEffect(() => {
    async function initializePayment() {
      try {
        // Check if Stripe is configured
        if (!stripeService.isConfigured()) {
          setError('Stripe is not configured. Please set up Stripe API keys.');
          setLoading(false);
          return;
        }

        // Create a payment intent
        const secret = await stripeService.createPaymentIntent(amount, currency);
        
        if (!secret) {
          throw new Error('Failed to create payment intent');
        }
        
        setClientSecret(secret);
      } catch (err: any) {
        console.error('Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment');
        toast({
          title: 'Payment Error',
          description: err.message || 'Failed to initialize payment',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    initializePayment();
  }, [amount, currency, toast]);

  const handlePaymentSuccess = () => {
    // Redirect to payments page with success status
    setLocation('/payments?status=success');
  };

  // Check if Stripe is configured
  const isStripeConfigured = stripeService.isConfigured();

  if (!isStripeConfigured) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment System Not Configured</CardTitle>
            <CardDescription>
              Stripe payment integration requires configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              The payment system is not yet configured. To enable payments, an administrator needs to:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Create a Stripe account at stripe.com</li>
              <li>Add Stripe API keys to the application's environment</li>
              <li>Set <code className="bg-muted p-1 rounded">VITE_STRIPE_PUBLIC_KEY</code> and <code className="bg-muted p-1 rounded">STRIPE_SECRET_KEY</code></li>
              <li>Restart the application</li>
            </ol>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={() => setLocation('/payments')}>
              Return to Payments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing payment...</span>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>
              There was a problem initializing the payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md mb-4">
              {error || 'Failed to initialize payment. Please try again.'}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary" onClick={() => setLocation('/payments')}>
              Return to Payments
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>
            Secure payment for your BJJ membership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 border-b pb-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Monthly Membership</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
          
          <Elements 
            stripe={stripeService.getStripe()} 
            options={{ clientSecret, appearance: { theme: 'night' } }}
          >
            <CheckoutForm onPaymentSuccess={handlePaymentSuccess} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}