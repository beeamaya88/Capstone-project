import express from 'express';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.js';



const router = express.Router();

// GET user's cart
router.get('/:userId', getCart);

// ADD item to cart
router.post('/:userId/add', addToCart);

// UPDATE cart item quantity
router.put('/:userId/item/:itemId', updateCartItem);

// REMOVE item from cart
router.delete('/:userId/item/:itemId', removeFromCart);

// CLEAR entire cart
router.delete('/:userId/clear', clearCart);

export default router;