import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userStore from '../slices/userSlice';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Wishlist() {
  const { user } = userStore();  // ✅ Changed from useAuth to userStore
  
  // Lazy initialization - loads wishlist during initial render
  const [wishlist, setWishlist] = useState(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  const [notification, setNotification] = useState({ show: false, message: '' });

  // Save changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlist, user]);

  // Listen for wishlist updates from other tabs/windows
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (user) {
        const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, [user]);

  // Remove item from wishlist
  const removeFromWishlist = (productId, productName) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    
    setNotification({ 
      show: true, 
      message: `${productName} removed from wishlist` 
    });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    if (wishlist.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlist([]);
      setNotification({ show: true, message: 'Wishlist cleared successfully' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }
  };

  // Add to cart
  const addToCart = (product) => {
    const savedCart = localStorage.getItem(`cart_${user.id}`);
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      cart = cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setNotification({ show: true, message: `${product.name} added to cart!` });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  // Animation styles
  const animationStyles = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;

  // If not logged in
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">My Wishlist</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <HeartIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-medium text-gray-900">Sign in to view your wishlist</h2>
          <p className="mt-2 text-gray-600">Please sign in to see items you've saved to your wishlist</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => window.location.href = '/signin'}  // ✅ Changed from Link to button with onClick
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/signup'}  // ✅ Changed from Link to button with onClick
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <style>{animationStyles}</style>
      
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 pr-6 flex items-center gap-3">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-800 font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '' })}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">My Wishlist</h1>
          <p className="mt-2 text-lg text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Wishlist
          </button>
        )}
      </div>

      {/* Wishlist Grid */}
      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <HeartIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Browse our products and click the heart icon to add items to your wishlist
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Heart indicator */}
              <div className="absolute top-3 left-3 z-10">
                <HeartIconSolid className="h-5 w-5 text-rose-500" />
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(product.id, product.name)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="h-4 w-4 text-rose-500" />
              </button>

              {/* Product Image */}
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {product.priceDisplay}
                  </p>
                  
                  {/* Category badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {product.category?.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <ShoppingBagIcon className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      {wishlist.length > 0 && (
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}