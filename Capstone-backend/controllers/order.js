import Cart from '../models/cart.js';
import Order from '../models/Order.js'; 

// Create order after successful payment
export const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      sessionId, 
      paymentStatus,
      shippingDetails,
      billingDetails,
      items,
      subtotal,
      shipping,
      tax,
      total,
      deliveryMethod
    } = req.body;

    // Create new order
    const order = new Order({
      userId,
      sessionId,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentStatus,
      shippingDetails,
      billingDetails,
      items,
      subtotal,
      shipping,
      tax,
      total,
      deliveryMethod,
      status: 'pending'
    });

    await order.save();

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );
    console.log(`Cart cleared for user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get order by Stripe session ID
export const getOrderBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const order = await Order.findOne({ sessionId });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, error: 'Unauthorized' });
    // }
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 });
      // .populate('userId', 'name email'); // Uncomment if you want user details

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ['paid', 'unpaid', 'refunded'];
    
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    // Can only cancel if status is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};