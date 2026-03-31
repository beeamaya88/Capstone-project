import mongoose from 'mongoose';

export const PRODUCT_CATEGORIES = ['herb-seeds', 'flower-seeds', 'garden-pots', 'garden-books', 'digital-guides'];

const seedAmountSchema = new mongoose.Schema({
  amount: String,
  multiplier: Number,
  enabled: Boolean
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: PRODUCT_CATEGORIES
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  description: { 
    type: String, 
    required: true 
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  features: [String],
  images: [{
    url: String,
    altText: String,
    publicId: String // For Cloudinary
  }],
  // Seed-specific fields
  seedAmounts: [seedAmountSchema],
  maxQuantity: { 
    type: Number, 
    default: 10 
  },
  // Pot-specific fields
  potSize: String,
  // Computed field for display
  shortDescription: String, 
}, { 
  timestamps: true 
});

// Create short description before saving
productSchema.pre('save', function() {
  if (this.description) {
    this.shortDescription = this.description.length < 157 
      ? this.description 
      : `${this.description.substring(0, 157)}...`;
  }
 
});

const Product = mongoose.model('Product', productSchema);
export default Product;