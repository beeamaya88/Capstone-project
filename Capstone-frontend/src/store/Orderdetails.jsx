import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import userStore from '../slices/userSlice';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = userStore();
  const { orderId } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  useEffect(() => {
    // If no user, redirect to signin
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        console.log('Fetching order:', orderId);
        
        const response = await fetch(`${API_URL}/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Order not found');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.order);
        } else {
          throw new Error(data.error || 'Failed to fetch order');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, user, navigate, API_URL]);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    return (
      <>
        <p>{address.name}</p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>{address.city}, {address.state} {address.postal_code}</p>
        <p>{address.country}</p>
        {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/account"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Account
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
                <p className="text-indigo-100 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/112'}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/112';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.selectedAmount && `${item.selectedAmount} seeds · `}
                          Qty {item.quantity}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <p className="text-base font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">${order.shipping.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Tax</dt>
                  <dd className="font-medium text-gray-900">${order.tax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-base font-medium pt-3 border-t border-gray-200">
                  <dt className="text-gray-900">Total</dt>
                  <dd className="text-indigo-600 text-xl">${order.total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                <address className="not-italic text-sm text-gray-600">
                  {formatAddress(order.shippingDetails)}
                </address>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Method</h3>
                <p className="text-sm text-gray-600 capitalize">{order.deliveryMethod || 'Standard'} Shipping</p>
                <p className="text-xs text-gray-400 mt-1">Estimated delivery: 7-14 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    VISA
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-700">Paid via Stripe</p>
                    <p>Payment confirmed on {formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Billing Address</h3>
                <address className="not-italic text-sm text-gray-600">
                  {order.billingDetails ? formatAddress(order.billingDetails) : 'Same as shipping address'}
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;