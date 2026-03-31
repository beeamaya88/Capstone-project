import express from 'express';
import { 
  createCheckoutSession, 
  stripeWebhook, 
  verifyPayment,
  createOrderAfterPayment 
} from '../controllers/payment.js';

const router = express.Router();

// Create Stripe checkout session
router.post('/create-checkout-session', createCheckoutSession);

// Create order after payment (client-side fallback)
router.post('/create-order', createOrderAfterPayment);

// Verify payment status
router.get('/verify/:sessionId', verifyPayment);

// Stripe webhook (needs raw body, not JSON parsed)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;