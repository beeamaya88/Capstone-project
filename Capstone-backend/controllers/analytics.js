import Stripe from 'stripe';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET);

// Get Stripe financial data
export const getStripeAnalytics = async (req, res) => {
  try {
    // Get balance data
    const balance = await stripe.balance.retrieve();
    
    // Get recent transactions
    const transactions = await stripe.balanceTransactions.list({
      limit: 50
    });
    
    // Get payouts
    const payouts = await stripe.payouts.list({
      limit: 10
    });
    
    // Get charges for daily revenue (last 30 days)
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    
    const charges = await stripe.charges.list({
      created: {
        gte: thirtyDaysAgo
      },
      limit: 100
    });

    // Calculate daily totals
    const dailyRevenue = {};
    charges.data.forEach(charge => {
      const date = new Date(charge.created * 1000).toLocaleDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + (charge.amount / 100);
    });

    // Format daily revenue for chart
    const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        balance: {
          available: balance.available[0]?.amount / 100 || 0,
          pending: balance.pending[0]?.amount / 100 || 0,
          currency: balance.available[0]?.currency || 'usd'
        },
        recentTransactions: transactions.data.slice(0, 10).map(t => ({
          id: t.id,
          amount: t.amount / 100,
          currency: t.currency,
          description: t.description || 'Transaction',
          type: t.type,
          created: new Date(t.created * 1000).toISOString()
        })),
        recentPayouts: payouts.data.map(p => ({
          id: p.id,
          amount: p.amount / 100,
          status: p.status,
          arrivalDate: new Date(p.arrival_date * 1000).toISOString()
        })),
        dailyRevenue: dailyRevenueArray
      }
    });
  } catch (error) {
    console.error('Error fetching Stripe analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get order-based analytics from your database
export const getOrderAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({});
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Orders by status
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Payment status
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const unpaidOrders = orders.filter(o => o.paymentStatus !== 'paid').length;
    
    // Orders by date (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }
    
    // Top products
    const productCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.name || 'Unknown';
        if (!productCounts[key]) {
          productCounts[key] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            imageUrl: item.imageUrl
          };
        }
        productCounts[key].quantity += item.quantity || 0;
        productCounts[key].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });
    
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        statusCounts,
        paidOrders,
        unpaidOrders,
        last7Days,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get dashboard summary (for the home page)
export const getDashboardSummary = async (req, res) => {
  try {
    const orders = await Order.find({});
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });
    
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // This month's stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    // Recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(o => ({
        id: o.orderNumber,
        date: new Date(o.createdAt).toLocaleDateString(),
        customer: o.shippingDetails?.name || 'Unknown',
        total: o.total || 0,
        status: o.status,
        paymentStatus: o.paymentStatus
      }));

    res.json({
      success: true,
      data: {
        todayRevenue,
        todayOrders: todayOrders.length,
        monthRevenue,
        monthOrders: monthOrders.length,
        totalOrders: orders.length,
        pendingOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};