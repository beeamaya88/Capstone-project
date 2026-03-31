import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: String,
  price: Number,
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  selectedAmount: String, // For seed products
  imageUrl: String,
  category: String
});

const addressSchema = new mongoose.Schema({
  name: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postal_code: String,
  country: String,
  phone: String
});

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true,
    unique: true 
  },
  orderNumber: { 
    type: String, 
    required: true,
    unique: true 
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded'],
    default: 'unpaid'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingDetails: addressSchema,
  billingDetails: addressSchema,
  items: [orderItemSchema],
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  deliveryMethod: String,
  notes: String
}, { 
  timestamps: true 
});

const Order = mongoose.model('Order', orderSchema);
export default Order;