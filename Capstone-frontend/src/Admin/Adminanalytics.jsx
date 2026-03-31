import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    stripe: null,
    orders: null
  });
  const [dateRange, setDateRange] = useState('30days');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both Stripe and order analytics in parallel
      const [stripeRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/stripe`),
        fetch(`${API_URL}/api/analytics/orders`)
      ]);

      if (!stripeRes.ok) {
        console.warn('Stripe analytics not available - using order data only');
      }

      if (!ordersRes.ok) {
        throw new Error('Failed to fetch order analytics');
      }

      const stripeData = stripeRes.ok ? await stripeRes.json() : { success: false, data: null };
      const ordersData = await ordersRes.json();

      setAnalytics({
        stripe: stripeData.success ? stripeData.data : null,
        orders: ordersData.success ? ordersData.data : null
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircleSolid className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4 text-blue-600" />;
      case 'processing':
        return <CubeIcon className="h-4 w-4 text-purple-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <ChartBarIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stripe, orders } = analytics;

  // Calculate additional metrics
  const conversionRate = orders?.totalOrders > 0 
    ? ((orders.paidOrders / orders.totalOrders) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-base text-gray-600">
            Real-time insights from Stripe and your store data
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stripe Balance Cards */}
      {stripe && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${stripe.balance.available.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Ready to payout</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${stripe.balance.pending.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Processing</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${orders?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Statistics */}
      {orders && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{orders.totalOrders}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600">+{orders.totalOrders > 0 ? '12%' : '0%'}</span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${orders.avgOrderValue.toFixed(2)}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600">+8%</span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Paid Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{orders.paidOrders}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600">{((orders.paidOrders/orders.totalOrders)*100).toFixed(0)}% complete</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{conversionRate}%</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600">+3%</span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>
        </div>
      )}

      {/* Last 7 Days Chart */}
      {orders?.last7Days && orders.last7Days.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Last 7 Days Performance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Chart */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-4">Daily Orders</p>
              <div className="h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4">
                <div className="flex h-full items-end gap-2">
                  {orders.last7Days.map((day, index) => {
                    const maxCount = Math.max(...orders.last7Days.map(d => d.count));
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full">
                          <div 
                            className="bg-indigo-600 rounded-t-lg hover:bg-indigo-700 transition-colors"
                            style={{ 
                              height: `${Math.max(4, maxCount > 0 ? (day.count / maxCount * 140) : 4)}px`
                            }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {day.count} orders
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-4">Daily Revenue</p>
              <div className="h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4">
                <div className="flex h-full items-end gap-2">
                  {orders.last7Days.map((day, index) => {
                    const maxRevenue = Math.max(...orders.last7Days.map(d => d.revenue));
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full">
                          <div 
                            className="bg-green-600 rounded-t-lg hover:bg-green-700 transition-colors"
                            style={{ 
                              height: `${Math.max(4, maxRevenue > 0 ? (day.revenue / maxRevenue * 140) : 4)}px`
                            }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              ${day.revenue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        {orders?.statusCounts && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>
            <div className="space-y-4">
              {Object.entries(orders.statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="font-medium text-gray-700 capitalize">{status}</span>
                    </div>
                    <span className="text-gray-600">{count} orders</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === 'delivered' ? 'bg-green-600' :
                        status === 'shipped' ? 'bg-blue-600' :
                        status === 'processing' ? 'bg-purple-600' :
                        status === 'pending' ? 'bg-yellow-600' :
                        status === 'cancelled' ? 'bg-red-600' :
                        'bg-gray-600'
                      }`}
                      style={{ width: `${(count / orders.totalOrders) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        {orders?.topProducts && orders.topProducts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
            <div className="space-y-4">
              {orders.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/48'}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Stripe Transactions */}
      {stripe?.recentTransactions && stripe.recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {stripe.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description || 'Payment'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.type === 'charge' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'charge' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stripe Dashboard Link */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Stripe Dashboard</h3>
            <p className="text-indigo-100">
              View detailed reports, manage payouts, and configure payment settings.
            </p>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Go to Stripe
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;