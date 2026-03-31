import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
    min: 1, 
    default: 1 
  },
  selectedAmount: String, // For seed products (100, 200, 300)
  imageUrl: String,
  category: String
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // One cart per user
  },
  items: [cartItemSchema],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;