import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';



// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  try {
    // Convert buffer to base64
    const base64Image = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Image}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'capstone-products',
      use_filename: true,
      unique_filename: true
    });
    console.log(result);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      altText: file.originalname
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// CREATE PRODUCT - matches your frontend form
export const createProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Received files:', req.files?.length);

    // Check for images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'At least one product image is required' 
      });
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      try {
        const imageData = await uploadImageToCloudinary(file);
        uploadedImages.push(imageData);
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload images' 
        });
      }
    }

    // Parse seedAmounts if it's a string
    let seedAmounts = req.body.seedAmounts;
    if (seedAmounts && typeof seedAmounts === 'string') {
      try {
        seedAmounts = JSON.parse(seedAmounts);
      } catch (e) {
        console.error('Failed to parse seedAmounts:', e);
        return res.status(400).json({ 
          error: 'Invalid seed amounts format' 
        });
      }
    }

    // Handle features array
    let features = req.body.features;
    if (features && !Array.isArray(features)) {
      features = [features];
    }
    // Filter out empty features
    features = features?.filter(f => f && f.trim() !== '') || [];

    // Create product object matching your form structure
    const productData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      description: req.body.description,
      inStock: req.body.inStock === 'true' || req.body.inStock === true,
      features: features,
      images: uploadedImages,
      maxQuantity: parseInt(req.body.maxQuantity) || 10,
      featured: req.body.featured === 'true' || req.body.featured === true, //featured products
    };

    // Add seed-specific fields
    if (req.body.category === 'herb-seeds' || req.body.category === 'flower-seeds') {
      productData.seedAmounts = seedAmounts;
    }

    // Add pot-specific fields
    if (req.body.category === 'garden-pots' && req.body.potSize) {
      productData.potSize = req.body.potSize;
    }

    // Create and save product
    const product = new Product(productData);
    await product.save();

    console.log('Product saved successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create product' 
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// GET FEATURED PRODUCTS
export const getFeaturedProducts = async (req, res) => {
  try {
    // Fetch 4 latest products that are featured
    const products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured products' });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    //adds featured product    
     if (updates.featured !== undefined) {
      updates.featured = updates.featured === 'true' || updates.featured === true; 
    } 

    // Parse JSON fields if they're strings
    if (updates.seedAmounts && typeof updates.seedAmounts === 'string') {
      updates.seedAmounts = JSON.parse(updates.seedAmounts);
    }
    
    if (updates.features && typeof updates.features === 'string') {
      updates.features = JSON.parse(updates.features);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};