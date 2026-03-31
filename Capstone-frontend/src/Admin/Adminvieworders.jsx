import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const AdminViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaid, setFilterPaid] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  // Check screen size for responsive view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1280);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/orders/admin/all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses', icon: ClockIcon },
    { value: 'pending', label: 'Pending', icon: ClockIcon },
    { value: 'processing', label: 'Processing', icon: CubeIcon },
    { value: 'shipped', label: 'Shipped', icon: TruckIcon },
    { value: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
    { value: 'cancelled', label: 'Cancelled', icon: XMarkIcon },
  ];

  const paidOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
  ];

  const announceToScreenReader = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await response.json();

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      announceToScreenReader(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      announceToScreenReader(`Failed to update order status: ${err.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handlePaidToggle = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      const order = orders.find(o => o._id === orderId);
      const newPaymentStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';

      const response = await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      await response.json();

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        )
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }

      announceToScreenReader(`Order ${orderId} payment status changed to ${newPaymentStatus}`);
    } catch (err) {
      console.error('Error updating payment:', err);
      announceToScreenReader(`Failed to update payment status: ${err.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPaid = filterPaid === 'all' || 
      (filterPaid === 'paid' && order.paymentStatus === 'paid') || 
      (filterPaid === 'unpaid' && order.paymentStatus !== 'paid');
    
    return matchesSearch && matchesStatus && matchesPaid;
  });

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const totals = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    unpaid: orders.filter(o => o.paymentStatus !== 'paid').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0)
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && selectedOrder) {
        setSelectedOrder(null);
        announceToScreenReader('Modal closed');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <XMarkIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Screen reader announcement region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-base text-gray-600">
            Manage and track all customer orders. View details, update status, and process payments.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Total Orders" 
          value={totals.total} 
          icon={CubeIcon}
          color="indigo"
        />
        <StatCard 
          title="Revenue" 
          value={`$${totals.revenue.toFixed(2)}`} 
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard 
          title="Pending" 
          value={totals.pending} 
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard 
          title="Unpaid" 
          value={totals.unpaid} 
          icon={XMarkIcon}
          color="red"
        />
        <StatCard 
          title="Delivered" 
          value={totals.delivered} 
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search orders
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm transition-shadow"
                placeholder="Search orders..."
                aria-label="Search orders"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Paid Filter */}
          <div>
            <label htmlFor="paid-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by payment
            </label>
            <select
              id="paid-filter"
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
            >
              {paidOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Orders Display - Card Layout for screens below 1280px, Table for larger screens */}
      {isMobileView ? (
        // Mobile/Tablet Card Layout (screens below 1280px)
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div>
                  <span className="text-sm font-semibold text-indigo-600">#{order.orderNumber}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                  >
                    View <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.shippingDetails?.name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {order.shippingDetails?.email || 'N/A'}
                </p>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="text-sm font-medium text-gray-900">{order.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-bold text-gray-900">${order.total?.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment and Status */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handlePaidToggle(order._id)}
                  disabled={updatingOrder === order._id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  } ${updatingOrder === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updatingOrder === order._id ? (
                    <span>Updating...</span>
                  ) : order.paymentStatus === 'paid' ? (
                    <>
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Paid</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="h-3 w-3" />
                      <span>Unpaid</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  {getStatusIcon(order.status)}
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={updatingOrder === order._id}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeColor(order.status)} ${updatingOrder === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state for card layout */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-base font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        // Desktop Table Layout (screens 1280px and above)
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-[12%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                  <th scope="col" className="w-[18%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th scope="col" className="w-[10%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="w-[8%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                  <th scope="col" className="w-[10%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th scope="col" className="w-[12%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                  <th scope="col" className="w-[17%] px-4 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="w-[13%] px-4 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-indigo-600">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate" title={order.shippingDetails?.name}>
                        {order.shippingDetails?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={order.shippingDetails?.email}>
                        {order.shippingDetails?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{order.items?.length || 0}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-semibold text-gray-900">${order.total?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handlePaidToggle(order._id)}
                        disabled={updatingOrder === order._id}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap min-w-[80px] ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500'
                        } ${updatingOrder === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label={`Mark order ${order.orderNumber} as ${order.paymentStatus === 'paid' ? 'unpaid' : 'paid'}`}
                      >
                        {updatingOrder === order._id ? (
                          <span>Updating...</span>
                        ) : order.paymentStatus === 'paid' ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Unpaid</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className={`rounded-full border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-w-[100px] text-center ${getStatusBadgeColor(order.status)} ${updatingOrder === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={`Change status for order ${order.orderNumber}`}
                          style={{ textAlignLast: 'center' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-4 py-2 whitespace-nowrap min-w-[70px]"
                        aria-label={`View details for order ${order.orderNumber}`}
                      >
                        View
                        <span className="text-indigo-400" aria-hidden="true">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state for table layout */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-base font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto" 
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <div 
              className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all sm:w-full sm:max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white" id="modal-title">
                    Order Details - {selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-lg bg-white/10 p-2.5 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Customer Information */}
                  <section>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                      Customer Information
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-base text-gray-900">{selectedOrder.shippingDetails?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-base text-gray-900">{selectedOrder.shippingDetails?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-base text-gray-900">{selectedOrder.shippingDetails?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                        <p className="text-base text-gray-900">
                          {selectedOrder.shippingDetails?.line1}
                          {selectedOrder.shippingDetails?.line2 && `, ${selectedOrder.shippingDetails.line2}`}
                          {selectedOrder.shippingDetails?.city && `, ${selectedOrder.shippingDetails.city}`}
                          {selectedOrder.shippingDetails?.state && `, ${selectedOrder.shippingDetails.state}`}
                          {selectedOrder.shippingDetails?.postal_code && ` ${selectedOrder.shippingDetails.postal_code}`}
                          {selectedOrder.shippingDetails?.country && `, ${selectedOrder.shippingDetails.country}`}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Order Items */}
                  <section>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                      Order Items
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                              {item.selectedAmount && (
                                <p className="text-xs text-gray-400">{item.selectedAmount} seeds</p>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No items in this order</p>
                      )}
                    </div>
                  </section>

                  {/* Order Information */}
                  <section>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                      Order Information
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Order Date</p>
                          <p className="text-base text-gray-900">{formatDateTime(selectedOrder.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Session ID</p>
                          <p className="text-sm text-gray-600 break-all">{selectedOrder.sessionId}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Subtotal</p>
                          <p className="text-base text-gray-900">${selectedOrder.subtotal?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Shipping</p>
                          <p className="text-base text-gray-900">${selectedOrder.shipping?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tax</p>
                          <p className="text-base text-gray-900">${selectedOrder.tax?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Delivery Method</p>
                          <p className="text-base text-gray-900 capitalize">{selectedOrder.deliveryMethod || 'Standard'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-indigo-600">${selectedOrder.total?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Payment Status</p>
                          <button
                            onClick={() => {
                              handlePaidToggle(selectedOrder._id);
                            }}
                            disabled={updatingOrder === selectedOrder._id}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mt-1 ${
                              selectedOrder.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            } ${updatingOrder === selectedOrder._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updatingOrder === selectedOrder._id ? (
                              <span>Updating...</span>
                            ) : selectedOrder.paymentStatus === 'paid' ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Paid
                              </>
                            ) : (
                              <>
                                <ClockIcon className="h-4 w-4" />
                                Unpaid
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Order Status */}
                  <section>
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                      Order Status
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label htmlFor="modal-status" className="block text-sm font-medium text-gray-500 mb-2">
                        Update Status
                      </label>
                      <select
                        id="modal-status"
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleStatusChange(selectedOrder._id, e.target.value);
                        }}
                        disabled={updatingOrder === selectedOrder._id}
                        className={`w-full rounded-xl border-0 py-3 px-4 text-base font-medium focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeColor(selectedOrder.status)} ${updatingOrder === selectedOrder._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 pt-4 pb-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  aria-label="Close order details modal"
                >
                  <span>Close</span>
                  <span className="text-indigo-200 text-sm" aria-hidden="true">(ESC)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  const IconComponent = icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
          <p className="text-lg sm:text-2xl sm:mt-2 font-bold text-gray-900">{value}</p>
        </div>
        <div className={`h-8 w-8 sm:h-12 sm:w-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <IconComponent className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default AdminViewOrders;