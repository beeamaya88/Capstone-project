/* eslint-disable no-undef */
import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment variables
// Vite uses import.meta.env instead of process.env
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                               import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Create and cache the Stripe promise
let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    // Check if key exists
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error(' Stripe publishable key is missing. Please check your .env file.');
      console.log('Available env vars:', import.meta.env);
      return Promise.resolve(null);
    }

    try {
      console.log(' Initializing Stripe...');
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    } catch (error) {
      console.error(' Failed to initialize Stripe:', error);
      return Promise.resolve(null);
    }
  }
  return stripePromise;
};

// Optional: Add a function to check if Stripe is properly configured
export const isStripeConfigured = () => {
  return !!STRIPE_PUBLISHABLE_KEY;
};