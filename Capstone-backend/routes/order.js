import express from 'express';
import { 
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderBySessionId,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  updatePaymentStatus
} from '../controllers/order.js';

const router = express.Router();

// Create order (usually called from webhook or after payment success)
router.post('/', createOrder);

// Get all orders (admin only) - IMPORTANT: Place this BEFORE the /:orderId route
router.get('/admin/all', getAllOrders);

// Get user's orders
router.get('/user/:userId', getUserOrders);

// Get order by Stripe session ID
router.get('/session/:sessionId', getOrderBySessionId);

// Get order by ID (this must come AFTER specific routes like /admin/all and /user/:userId)
router.get('/:orderId', getOrderById);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

// Update payment status
router.patch('/:orderId/payment', updatePaymentStatus);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

export default router;