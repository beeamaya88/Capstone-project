import Stripe from 'stripe';
import Order from '../models/Order.js';
import Cart from '../models/cart.js';

const stripe = new Stripe(process.env.STRIPE_SECRET);

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { 
      lineItems, 
      customerEmail, 
      shippingDetails, 
      billingDetails, 
      shippingMethod,
      total,
      userId, // Make sure to pass userId from frontend
      orderData // Pass the complete order data
    } = req.body;

    console.log('Creating checkout session for:', customerEmail);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URI}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URI}/checkout`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX', 'GB'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500,
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 4 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1600,
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      metadata: {
        userId: userId || '',
        shippingMethod: shippingMethod || '',
        customer_name: shippingDetails?.name || '',
        customer_phone: shippingDetails?.phone || '',
        // Stringify the order data to store in metadata
        orderData: JSON.stringify(orderData || {})
      }
    });

    res.json({ 
      success: true,
      id: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Stripe webhook handler
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', {
        sessionId: session.id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        metadata: session.metadata
      });
      
      try {
        // Create order in database
        await createOrderFromSession(session);
      } catch (error) {
        console.error('Error creating order from webhook:', error);
      }
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to create order from Stripe session
async function createOrderFromSession(session) {
  try {
    // Check if order already exists
    const existingOrder = await Order.findOne({ sessionId: session.id });
    if (existingOrder) {
      console.log('Order already exists for session:', session.id);
      return existingOrder;
    }

    // Parse order data from metadata
    let orderData = {};
    if (session.metadata && session.metadata.orderData) {
      try {
        orderData = JSON.parse(session.metadata.orderData);
      } catch (e) {
        console.error('Error parsing order data from metadata:', e);
      }
    }

    // Get line items from Stripe session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    // Format items for our database
    const items = lineItems.data.map(item => ({
      productId: item.price?.product || 'unknown',
      name: item.description,
      price: item.amount_total / 100 / item.quantity,
      quantity: item.quantity,
      imageUrl: '', // You might want to store this from your metadata
      category: orderData.items?.[0]?.category || ''
    }));

    // Create order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const order = new Order({
      userId: session.metadata?.userId || orderData.userId,
      sessionId: session.id,
      orderNumber,
      paymentStatus: 'paid',
      status: 'pending',
      shippingDetails: {
        name: session.metadata?.customer_name || '',
        line1: session.shipping_details?.address?.line1 || '',
        line2: session.shipping_details?.address?.line2 || '',
        city: session.shipping_details?.address?.city || '',
        state: session.shipping_details?.address?.state || '',
        postal_code: session.shipping_details?.address?.postal_code || '',
        country: session.shipping_details?.address?.country || '',
        phone: session.metadata?.customer_phone || ''
      },
      items: items,
      subtotal: session.amount_subtotal / 100,
      shipping: session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0,
      tax: (session.total_details?.amount_tax || 0) / 100,
      total: session.amount_total / 100,
      deliveryMethod: session.metadata?.shippingMethod || 'standard'
    });

    await order.save();
    console.log('Order created successfully:', order.orderNumber);

    // Clear the user's cart
    if (session.metadata?.userId) {
      await Cart.findOneAndUpdate(
        { userId: session.metadata.userId },
        { $set: { items: [] } }
      );
    }

    return order;
  } catch (error) {
    console.error('Error creating order from session:', error);
    throw error;
  }
}

// Alternative: Create order immediately after checkout (client-side)
export const createOrderAfterPayment = async (req, res) => {
  try {
    const { sessionId, orderData } = req.body;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        order: existingOrder,
        message: 'Order already exists'
      });
    }

    // Get line items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    // Format items
    const items = lineItems.data.map(item => ({
      productId: item.price?.product || 'unknown',
      name: item.description,
      price: item.amount_total / 100 / item.quantity,
      quantity: item.quantity,
      imageUrl: orderData.items?.[0]?.imageUrl || '',
      category: orderData.items?.[0]?.category || '',
      selectedAmount: orderData.items?.[0]?.selectedAmount
    }));

    // Create order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const order = new Order({
      userId: orderData.userId,
      sessionId,
      orderNumber,
      paymentStatus: 'paid',
      status: 'pending',
      shippingDetails: orderData.shippingDetails,
      billingDetails: orderData.billingDetails || orderData.shippingDetails,
      items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      deliveryMethod: orderData.deliveryMethod
    });

    await order.save();

    // Clear the cart
    await Cart.findOneAndUpdate(
      { userId: orderData.userId },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
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

// Verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};