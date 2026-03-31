import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userStore from '../slices/userSlice';

const Account = () => {
  const { user } = userStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`http://localhost:3500/api/orders/user/${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your account</h2>
          <Link
            to="/signin"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">{user.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              <Link
                to="/account"
                className="block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium"
              >
                Order History
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                Profile Settings
              </Link>
              <Link
                to="/wishlist"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                Wishlist
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content - Order History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Error loading orders: {error}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order Number</p>
                        <p className="font-mono text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.name} {item.selectedAmount && `(${item.selectedAmount})`} x {item.quantity}
                            </span>
                            <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/order/${order._id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Order Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;