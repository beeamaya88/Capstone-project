import express from 'express';
import { 
  getStripeAnalytics, 
  getOrderAnalytics,
  getDashboardSummary
} from '../controllers/analytics.js';

const router = express.Router();

// Get Stripe financial data
router.get('/stripe', getStripeAnalytics);

// Get order-based analytics
router.get('/orders', getOrderAnalytics);

// Get dashboard summary (for home page)
router.get('/dashboard', getDashboardSummary);

export default router;