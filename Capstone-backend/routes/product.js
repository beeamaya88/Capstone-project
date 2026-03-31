import express from 'express';
import multer from 'multer';
import { 
  getProducts, 
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  getFeaturedProducts
} from '../controllers/product.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// GET all products (with optional category filter)
router.get('/', getProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// GET single product
router.get('/:id', getProductById);

// POST create new product - with multiple image upload
router.post('/add', upload.array('productImages', 5), createProduct);

// PUT update product
router.put('/:id', updateProduct);

// DELETE product
router.delete('/:id', deleteProduct);

export default router;