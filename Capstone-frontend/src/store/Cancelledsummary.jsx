import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon, ShoppingBagIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const CancelledSummary = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch order details from your backend
        const response = await fetch(`http://localhost:3500/api/orders/session/${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const cancellationRef = `CXL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-8 text-center relative">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <XCircleIcon className="h-12 w-12 text-amber-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Order Cancelled
              </h1>
              <p className="mt-2 text-lg text-white/90">
                Your order has been cancelled
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600">
                No worries at all! No payment has been processed.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {order ? `Order #${order.orderNumber}` : 'Your cart is saved and ready whenever you are.'}
              </p>
            </div>

            {/* Reference number */}
            <div className="mb-8 p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
              <p className="text-sm text-gray-500 mb-1">Cancellation Reference</p>
              <p className="text-xl font-mono font-medium text-amber-600 break-all">
                {cancellationRef}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Please reference this number when contacting support
              </p>
            </div>

            {order && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="h-6 w-1 bg-amber-600 rounded-full"></span>
                  Order Summary
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-4">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex items-center space-x-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white opacity-60">
                          <img
                            src={item.imageUrl || 'https://via.placeholder.com/112'}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
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
                            Qty {item.quantity}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Order totals */}
                  <dl className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500">Total would have been</dt>
                      <dd className="font-medium text-gray-900">${order.total?.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/cart"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Again
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Shop More
              </Link>
            </div>

            {/* Contact Support Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">
                Questions about your cancellation?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 font-medium rounded-xl hover:bg-amber-100 transition-colors group"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelledSummary;