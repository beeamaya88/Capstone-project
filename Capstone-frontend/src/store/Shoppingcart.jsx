import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userStore from '../slices/userSlice';
import cartStore from '../slices/cartSlice';

// Confirmation Modal Component
const RemoveConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the cancel button first
      cancelButtonRef.current?.focus();
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Modal Content */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {/* Warning Icon */}
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg 
                    className="h-6 w-6 text-red-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                    />
                  </svg>
                </div>
                
                {/* Text Content */}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 
                    id="modal-title" 
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Remove item from cart
                  </h3>
                  <div className="mt-2">
                    <p 
                      id="modal-description" 
                      className="text-base text-gray-500"
                    >
                      Are you sure you want to remove <span className="font-medium text-gray-900">"{itemName}"</span> from your shopping cart? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                aria-label="Confirm remove item"
              >
                Remove
              </button>
              <button
                type="button"
                ref={cancelButtonRef}
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                aria-label="Cancel and keep item in cart"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ShoppingCart = () => {
  const { user } = userStore();
  const { 
    items: cartItems, 
    loading, 
    error, 
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal
  } = cartStore();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isClearing, setIsClearing] = useState(false);

  // Load cart when user is available
  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    }
  }, [user, fetchCart]);

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1 || !user) return;
    
    const result = await updateCartItem(user.id, itemId, newQuantity);
    
    if (result.success) {
      setNotification({ 
        show: true, 
        message: 'Cart updated successfully',
        type: 'success'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } else {
      setNotification({ 
        show: true, 
        message: result.error || 'Failed to update cart',
        type: 'error'
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  // Open remove modal
  const openRemoveModal = (item) => {
    setItemToRemove(item);
    setModalOpen(true);
  };

  // Close remove modal
  const closeRemoveModal = () => {
    setModalOpen(false);
    setItemToRemove(null);
  };

  // Confirm remove item
  const confirmRemove = async () => {
    if (itemToRemove && user) {
      const result = await removeFromCart(user.id, itemToRemove._id);
      
      if (result.success) {
        setNotification({ 
          show: true, 
          message: `${itemToRemove.name} removed from cart`,
          type: 'success'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      } else {
        setNotification({ 
          show: true, 
          message: result.error || 'Failed to remove item',
          type: 'error'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
      closeRemoveModal();
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!user || cartItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      setIsClearing(true);
      const result = await clearCart(user.id);
      setIsClearing(false);
      
      if (result.success) {
        setNotification({ 
          show: true, 
          message: 'Cart cleared successfully',
          type: 'success'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
      } else {
        setNotification({ 
          show: true, 
          message: result.error || 'Failed to clear cart',
          type: 'error'
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
    }
  };

  // Calculate totals
  const shipping = subtotal > 0 ? 5.00 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return '';
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get image URL
  const getImageUrl = (item) => {
    if (item.imageUrl) return item.imageUrl;
    if (item.images && item.images.length > 0) return item.images[0].url;
    return 'https://via.placeholder.com/112';
  };

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-medium text-gray-900">Sign in to view your cart</h2>
          <p className="mt-2 text-gray-600">Please sign in to see items you've added to your cart</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/signin"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Notification Toast */}
      {notification.show && (
        <div 
            className={`fixed top-20 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Confirmation Modal */}
      <RemoveConfirmationModal
        isOpen={modalOpen}
        onClose={closeRemoveModal}
        onConfirm={confirmRemove}
        itemName={itemToRemove?.name || ''}
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
          >
            {isClearing ? 'Clearing...' : 'Clear Cart'}
          </button>
        )}
      </div>
      
      {cartItems.length === 0 ? (
        // Empty cart state
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet</p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart items - left column */}
          <div className="lg:col-span-7">
            {/* Error message if any */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                Error: {error}
              </div>
            )}

            <div className="flow-root">
              <ul className="-my-6 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item._id} className="flex py-8">
                    {/* Product image */}
                    <Link to={`/product/${item.productId}`} className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 hover:opacity-75 transition-opacity">
                      <img
                        src={getImageUrl(item)}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/112';
                        }}
                      />
                    </Link>

                    <div className="ml-6 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-lg font-medium text-gray-900">
                          <h3>
                            <Link to={`/product/${item.productId}`} className="hover:text-indigo-600 transition-colors">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="ml-4 text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        {/* Product details */}
                        <div className="mt-2 text-base text-gray-600 space-y-1">
                          {/* Show selected amount for seed products */}
                          {item.selectedAmount && (
                            <p className="text-sm text-gray-500">
                              Amount: <span className="font-medium">{item.selectedAmount} seeds</span>
                            </p>
                          )}
                          
                          {/* Category display */}
                          {item.category && (
                            <p className="text-sm text-gray-500 font-medium">
                              {formatCategory(item.category)}
                            </p>
                          )}

                          {/* Unit price */}
                          <p className="text-sm text-gray-500">
                            Unit price: <span className="font-medium">${item.price.toFixed(2)}</span>
                          </p>
                        </div>
                        
                        {/* In Stock Badge */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-green-600 font-medium text-base">In stock</span>
                        </div>
                      </div>
                      
                      {/* Quantity and Remove */}
                      <div className="flex flex-1 items-end justify-between text-base mt-6">
                        {/* Quantity dropdown */}
                        <div className="flex items-center border rounded-md">
                          <label htmlFor={`quantity-${item._id}`} className="sr-only">
                            Quantity, {item.name}
                          </label>
                          <select
                            id={`quantity-${item._id}`}
                            name={`quantity-${item._id}`}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                            className="max-w-full rounded-md border-0 py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Change quantity for ${item.name}`}
                            disabled={loading}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => openRemoveModal(item)}
                            className="text-base font-medium text-indigo-600 hover:text-indigo-500 transition-colors disabled:opacity-50"
                            aria-label={`Remove ${item.name} from cart`}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cart summary */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-base text-gray-600">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Continue shopping link */}
              <Link 
                to="/products" 
                className="text-base font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue shopping
              </Link>
            </div>
          </div>

          {/* Order summary - right column */}
          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg px-6 py-8 sm:p-8 lg:p-10">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order summary</h2>
              
              <div className="flow-root">
                <dl className="-my-4 text-base divide-y divide-gray-200">
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Shipping estimate</dt>
                    <dd className="font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Tax estimate (8%)</dt>
                    <dd className="font-medium text-gray-900">${tax.toFixed(2)}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between border-t border-gray-200">
                    <dt className="text-lg font-medium text-gray-900">Order total</dt>
                    <dd className="text-lg font-medium text-gray-900">${total.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8">
              <Link
                to="/cart/checkout"
                className={`w-full rounded-md border border-transparent bg-indigo-600 px-4 py-4 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors inline-block text-center ${
                cartItems.length === 0 || loading ? 'opacity-50 pointer-events-none' : ''
                  }`}
            aria-disabled={cartItems.length === 0 || loading}
              >
             {loading ? 'Processing...' : 'Checkout'}
              </Link>
              </div>
              {/* Payment methods */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>We accept:</p>
                <div className="mt-2 flex justify-center gap-3">
                  <span className="px-2 py-1 bg-white rounded border border-gray-200">Visa</span>
                  <span className="px-2 py-1 bg-white rounded border border-gray-200">Mastercard</span>
                  <span className="px-2 py-1 bg-white rounded border border-gray-200">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;