import { loadStripe, Stripe } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';

/**
 * Stripe service for handling payment operations
 * 
 * IMPORTANT: This is a boilerplate implementation. To enable Stripe functionality:
 * 1. Create a Stripe account
 * 2. Set the following environment variables:
 *    - VITE_STRIPE_PUBLIC_KEY: Your Stripe publishable key (starts with pk_)
 *    - STRIPE_SECRET_KEY: Your Stripe secret key (starts with sk_)
 * 3. Implement the server-side endpoints in server/routes.ts
 */
class StripeService {
  private stripePromise: Promise<Stripe | null> | null = null;

  constructor() {
    // Initialize Stripe only if the public key is available
    if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      this.stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    }
  }

  /**
   * Check if Stripe is properly configured
   */
  isConfigured(): boolean {
    return !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  }

  /**
   * Get the Stripe instance (or null if not configured)
   */
  getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      console.warn('Stripe is not configured. Set VITE_STRIPE_PUBLIC_KEY environment variable.');
      return Promise.resolve(null);
    }
    return this.stripePromise;
  }

  /**
   * Create a payment intent for a one-time payment
   * @param amount Amount in dollars (will be converted to cents)
   * @param currency Currency code (default: 'usd')
   */
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string | null> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Stripe is not configured');
      }

      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount,
        currency
      });
      
      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  /**
   * Create or get a subscription
   * @param priceId The Stripe price ID for the subscription
   */
  async createSubscription(priceId: string): Promise<{
    subscriptionId: string;
    clientSecret: string;
  } | null> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Stripe is not configured');
      }

      const response = await apiRequest('POST', '/api/create-subscription', {
        priceId
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  /**
   * Get customer payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        return [];
      }

      const response = await apiRequest('GET', '/api/payment-methods');
      return await response.json();
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  /**
   * Get customer subscription
   */
  async getSubscription(): Promise<any | null> {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const response = await apiRequest('GET', '/api/subscription');
      return await response.json();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const stripeService = new StripeService();