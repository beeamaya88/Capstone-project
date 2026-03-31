import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ShoppingBagIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import userStore from '../slices/userSlice';
import cartStore from '../slices/cartSlice'; // ADD THIS IMPORT

const OrderSummary = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { user } = userStore();
  const { clearCart } = cartStore(); // ADD THIS LINE
  const location = useLocation();
  const navigate = useNavigate();

  // Get session_id from URL
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');

  // API URL from environment or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  useEffect(() => {
    // If no session_id, redirect to home
    if (!sessionId) {
      navigate('/');
      return;
    }

    // If no user, redirect to signin
    if (!user) {
      navigate('/signin?redirect=order-confirmation');
      return;
    }

    const fetchOrCreateOrder = async () => {
      setLoading(true);
      try {
        console.log('Fetching order for session:', sessionId);
        
        // First verify payment with Stripe
        const verifyResponse = await fetch(`${API_URL}/api/payment/verify/${sessionId}`);
        
        if (!verifyResponse.ok) {
          throw new Error('Payment verification failed');
        }
        
        const verifyData = await verifyResponse.json();
        console.log('Verification data:', verifyData);

        if (verifyData.paymentStatus !== 'paid') {
          throw new Error('Payment not completed');
        }

        // Try to get pending order data from sessionStorage
        const pendingOrderData = sessionStorage.getItem('pendingOrder');
        let orderData = null;
        
        if (pendingOrderData) {
          try {
            orderData = JSON.parse(pendingOrderData);
            console.log('Found pending order data:', orderData);
          } catch (e) {
            console.error('Error parsing pending order data:', e);
          }
        }

        // Try to fetch the order from database
        let orderResponse = await fetch(`${API_URL}/api/orders/session/${sessionId}`);
        
        if (!orderResponse.ok) {
          console.log('Order not found, creating new order...');
          
          if (!orderData) {
            // Create minimal order data if no pending data exists
            orderData = {
              userId: user.id,
              items: [],
              shippingDetails: {
                name: user.name || 'Customer',
                email: user.email,
                line1: 'Address pending',
                city: 'City',
                state: 'State',
                postal_code: '00000',
                country: 'US'
              },
              subtotal: 0,
              shipping: 0,
              tax: 0,
              total: 0,
              deliveryMethod: 'standard'
            };
          }

          // Create the order
          const createResponse = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...orderData,
              sessionId,
              paymentStatus: 'paid',
              orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            }),
          });

          const createData = await createResponse.json();
          
          if (createData.success) {
            console.log('Order created successfully:', createData.order);
            setOrder(createData.order);
            
            // ===== IMPORTANT: CLEAR THE CART AFTER SUCCESSFUL ORDER =====
            if (user) {
              console.log('Clearing cart for user:', user.id);
              await clearCart(user.id);
              console.log('Cart cleared successfully');
            }
            // ===========================================================
            
            // Clear pending order data
            sessionStorage.removeItem('pendingOrder');
          } else {
            throw new Error(createData.error || 'Failed to create order');
          }
        } else {
          const orderData = await orderResponse.json();
          if (orderData.success) {
            console.log('Order fetched successfully:', orderData.order);
            setOrder(orderData.order);
            
            // ===== IMPORTANT: CLEAR THE CART AFTER SUCCESSFUL ORDER =====
            if (user) {
              console.log('Clearing cart for user:', user.id);
              await clearCart(user.id);
              console.log('Cart cleared successfully');
            }
            // ===========================================================
            
            // Clear pending order data if it exists
            sessionStorage.removeItem('pendingOrder');
          } else {
            throw new Error(orderData.error || 'Failed to fetch order');
          }
        }
      } catch (err) {
        console.error('Error in order confirmation:', err);
        setError(err.message);
        
        // Retry logic (max 3 retries)
        if (retryCount < 3) {
          console.log(`Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateOrder();
  }, [sessionId, user, navigate, retryCount, API_URL, clearCart]); // Added clearCart to dependencies

  // Calculate estimated delivery date (7-14 days from now)
  const getEstimatedDelivery = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);

    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return null;
    return (
      <>
        <p className="font-medium text-gray-700">{address.name || 'Customer'}</p>
        {address.line1 && <p>{address.line1}</p>}
        {address.line2 && <p>{address.line2}</p>}
        {address.city && address.state && address.postal_code && (
          <p>{address.city}, {address.state} {address.postal_code}</p>
        )}
        {address.country && <p>{address.country}</p>}
        {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">Retrying... ({retryCount}/3)</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <div className="space-y-3">
            <Link
              to="/products"
              className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center relative">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="h-12 w-12 text-indigo-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Payment Successful!
              </h1>
              <p className="mt-2 text-lg text-indigo-100">
                Thank you for your order
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Success Message */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600">
                We appreciate your order and are currently processing it.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                A confirmation email has been sent to {order.shippingDetails?.email || user?.email}
              </p>
            </div>

            {/* Order Number - Highlighted */}
            <div className="mb-8 p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-xl font-mono font-medium text-indigo-600 break-all">
                {order.orderNumber}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Please reference this number for any inquiries
              </p>
            </div>

            {/* Order Summary Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
                Order Summary
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <ul className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <li key={index} className="flex items-center space-x-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                          <img
                            src={item.imageUrl || 'https://via.placeholder.com/112'}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/112';
                            }}
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.selectedAmount && `${item.selectedAmount} seeds · `}
                            Qty {item.quantity}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-gray-500 py-4">
                      No items in this order
                    </li>
                  )}
                </ul>

                {/* Order Totals */}
                <dl className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Subtotal</dt>
                    <dd className="font-medium text-gray-900">${(order.subtotal || 0).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Shipping</dt>
                    <dd className="font-medium text-gray-900">${(order.shipping || 0).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Taxes</dt>
                    <dd className="font-medium text-gray-900">${(order.tax || 0).toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-3 border-t border-gray-200">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-indigo-600 text-xl">${(order.total || 0).toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Shipping and Payment Info - Two Column */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
                Shipping & Payment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Shipping Address
                  </h3>
                  <address className="not-italic text-sm text-gray-500">
                    {formatAddress(order.shippingDetails)}
                  </address>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-12 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      VISA
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="font-medium text-gray-700">Paid via Stripe</p>
                      <p>Payment confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Method */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Method</p>
                  <p className="text-sm text-gray-500 capitalize">{order.deliveryMethod || 'Standard'} Shipping</p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                  <p className="text-sm text-gray-500">{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Continue Shopping
              </Link>
              <Link
                to="/account"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                View Order History
              </Link>
            </div>

            {/* Contact Support Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Need help with your order?</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors group"
                >
                  <EnvelopeIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Email Support
                </Link>
                <a
                  href="tel:+18005551234"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <PhoneIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Call Us: 1-800-555-1234
                </a>
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">
                Please reference order number: {order.orderNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;