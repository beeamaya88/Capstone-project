import React, { useState, useEffect, useCallback } from 'react';
import { CreditCardIcon, CurrencyDollarIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AdminFinances = () => {
  const [loading, setLoading] = useState(false);
  const [stripeData, setStripeData] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  const fetchStripeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/analytics/stripe`);
      if (!response.ok) {
        throw new Error('Failed to fetch Stripe data');
      }
      const data = await response.json();
      if (data.success) {
        setStripeData(data.data);
      }
    } catch (err) {
      console.error('Error fetching Stripe data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchStripeData();
  }, [fetchStripeData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Finances
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Track your revenue, payouts, and financial metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchStripeData}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {stripeData ? (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Available Balance</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stripeData.balance.available.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCardIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Balance</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stripeData.balance.pending.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Recent Payouts</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stripeData.recentPayouts?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payouts */}
          {stripeData.recentPayouts && stripeData.recentPayouts.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Payouts</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {stripeData.recentPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${payout.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payout.arrivalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        payout.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stripe Dashboard Link */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium text-indigo-900">Stripe Dashboard</h3>
                <p className="mt-1 text-sm text-indigo-700">
                  View detailed reports, manage payouts, and configure payment settings.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Go to Stripe Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Connect to Stripe</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your Stripe account to view real financial data.
          </p>
          <div className="mt-6">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Go to Stripe
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinances;