import React, { useState, useEffect, useCallback } from "react";
import {
  Squares2X2Icon,
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import AdminAddProduct from "./Adminaddproduct";
import AdminViewOrders from "./Adminvieworders";
import AdminFinances from "./Adminfinances";
import AdminAllProducts from "./Adminallproducts";
import AdminUsers from "./Adminusers";
import AdminAnalytics from "./Adminanalytics";
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [openProducts, setOpenProducts] = useState(false);
  const [openProductsMobile, setOpenProductsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  // Check screen size for small screens (344px - 540px)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsSmallScreen(width >= 344 && width <= 540);
      
      // Close dropdown when screen size changes
      if (width > 540) {
        setAdminDropdownOpen(false);
        setOpenProductsMobile(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setAdminDropdownOpen(false);
        setOpenProductsMobile(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "add-product":
        return <AdminAddProduct />;
      case "products":
        return <AdminAllProducts />;
      case "view-orders":
        return <AdminViewOrders />;
      case "finances":
        return <AdminFinances />;
      case "users":
        return <AdminUsers />;
      case "analytics":
        return <AdminAnalytics />;
      case "messages":
        return (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Messages</h3>
            <p className="mt-2 text-gray-500">Coming soon</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <Cog6ToothIcon className="h-16 w-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Settings</h3>
            <p className="mt-2 text-gray-500">Coming soon</p>
          </div>
        );
      default:
        return <DashboardHome setActiveSection={setActiveSection} />;
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setAdminDropdownOpen(false);
    setOpenProductsMobile(false);
  };

  // Toggle products dropdown for mobile
  const toggleProductsMobile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenProductsMobile(!openProductsMobile);
  };

  // Toggle main admin dropdown
  const toggleAdminDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdminDropdownOpen(!adminDropdownOpen);
    if (adminDropdownOpen) {
      setOpenProductsMobile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Admin Panel Dropdown - BELOW Navbar (only on small screens 344px - 540px) */}
      {isSmallScreen && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          {/* Admin Panel Header with dropdown arrow */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-xl">A</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin Panel</p>
                <p className="text-xs text-gray-500">Manage your store</p>
              </div>
            </div>
            <button
              onClick={toggleAdminDropdown}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Toggle admin navigation"
            >
              <ChevronDownIcon 
                className={`h-5 w-5 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>

          {/* Admin Dashboard Dropdown Menu */}
          {adminDropdownOpen && (
            <div className="border-t border-gray-100 py-2 max-h-[80vh] overflow-y-auto">
              {/* Dashboard */}
              <button
                onClick={() => handleSectionChange("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "dashboard"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Dashboard</span>
              </button>

              {/* Products with submenu */}
              <div>
                <button
                  onClick={toggleProductsMobile}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                    ["products", "add-product"].includes(activeSection)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CubeIcon className="h-5 w-5" />
                    <span>Products</span>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openProductsMobile ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openProductsMobile && (
                  <div className="pl-11 space-y-1 pb-2 bg-gray-50">
                    <button
                      onClick={() => handleSectionChange("add-product")}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === "add-product"
                          ? "text-indigo-600 bg-indigo-100 font-medium"
                          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      Add Product
                    </button>
                    <button
                      onClick={() => handleSectionChange("products")}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === "products"
                          ? "text-indigo-600 bg-indigo-100 font-medium"
                          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      All Products
                    </button>
                  </div>
                )}
              </div>

              {/* Users */}
              <button
                onClick={() => handleSectionChange("users")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "users"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <UsersIcon className="h-5 w-5" />
                <span>Users</span>
              </button>

              {/* Orders */}
              <button
                onClick={() => handleSectionChange("view-orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "view-orders"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Orders</span>
              </button>

              {/* Analytics */}
              <button
                onClick={() => handleSectionChange("analytics")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "analytics"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Analytics</span>
              </button>

              {/* Finances */}
              <button
                onClick={() => handleSectionChange("finances")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "finances"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Finances</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => handleSectionChange("messages")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "messages"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Messages</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => handleSectionChange("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === "settings"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Settings</span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* User Info in Dropdown */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Admin"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                    <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex">
        {/* Sidebar - Hidden on small screens, visible on larger screens */}
        {!isSmallScreen && (
          <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AdminPanel</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col">
              <div className="space-y-1">
                {/* Dashboard */}
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "dashboard"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>

                {/* Products Dropdown */}
                <div>
                  <button
                    onClick={() => setOpenProducts(!openProducts)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      ["products", "add-product"].includes(activeSection)
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CubeIcon className="h-5 w-5" />
                      <span>Products</span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openProducts ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openProducts ? "max-h-40 mt-1" : "max-h-0"
                    }`}
                  >
                    <div className="pl-11 space-y-1">
                      <button
                        onClick={() => {
                          setActiveSection("add-product");
                          setOpenProducts(true);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeSection === "add-product"
                            ? "text-indigo-600 bg-indigo-50 font-medium"
                            : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                        }`}
                      >
                        Add Product
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection("products");
                          setOpenProducts(true);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeSection === "products"
                            ? "text-indigo-600 bg-indigo-50 font-medium"
                            : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                        }`}
                      >
                        All Products
                      </button>
                    </div>
                  </div>
                </div>

                {/* Users */}
                <button
                  onClick={() => setActiveSection("users")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "users"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <UsersIcon className="h-5 w-5" />
                  <span>Users</span>
                </button>

                {/* Orders */}
                <button
                  onClick={() => setActiveSection("view-orders")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "view-orders"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Orders</span>
                </button>

                {/* Analytics */}
                <button
                  onClick={() => setActiveSection("analytics")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "analytics"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Analytics</span>
                </button>

                {/* Finances */}
                <button
                  onClick={() => setActiveSection("finances")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "finances"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span>Finances</span>
                </button>

                {/* Messages */}
                <button
                  onClick={() => setActiveSection("messages")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "messages"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Messages</span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => setActiveSection("settings")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === "settings"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </div>

              {/* User Profile */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Admin"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                      <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </nav>
          </aside>
        )}

        {/* Main content */}
        <div className={`flex-1 flex flex-col min-w-0 bg-gray-50 ${isSmallScreen ? '' : ''}`}>
          {/* Header - Shows on larger screens only */}
          {!isSmallScreen && (
            <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 flex items-center justify-between px-8 sticky top-0 z-10">
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {activeSection === "view-orders"
                  ? "Orders"
                  : activeSection === "add-product"
                  ? "Add Product"
                  : activeSection === "finances"
                  ? "Finances"
                  : activeSection === "products"
                  ? "All Products"
                  : activeSection === "users"
                  ? "User Management"
                  : activeSection === "analytics"
                  ? "Analytics"
                  : activeSection === "messages"
                  ? "Messages"
                  : activeSection === "settings"
                  ? "Settings"
                  : activeSection.replace("-", " ")}
              </h1>
              
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </header>
          )}

          {/* Mobile Title - Only on small screens */}
          {isSmallScreen && (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <h1 className="text-sm font-semibold text-gray-800 capitalize">
                {activeSection === "view-orders"
                  ? "Orders"
                  : activeSection === "add-product"
                  ? "Add Product"
                  : activeSection === "finances"
                  ? "Finances"
                  : activeSection === "products"
                  ? "All Products"
                  : activeSection === "users"
                  ? "Users"
                  : activeSection === "analytics"
                  ? "Analytics"
                  : activeSection === "messages"
                  ? "Messages"
                  : activeSection === "settings"
                  ? "Settings"
                  : activeSection === "dashboard"
                  ? "Dashboard"
                  : activeSection.replace("-", " ")}
              </h1>
            </div>
          )}

          {/* Page Content */}
          <main className={`flex-1 overflow-y-auto ${isSmallScreen ? 'p-4' : 'p-8'}`}>
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component with Real Data (unchanged)
const DashboardHome = ({ setActiveSection }) => {
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    totalOrders: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const stats = [
    { 
      title: "Today's Revenue", 
      value: formatCurrency(dashboardData.todayRevenue), 
      change: "+12.3%", 
      icon: CurrencyDollarIcon 
    },
    { 
      title: "Today's Orders", 
      value: dashboardData.todayOrders.toString(), 
      change: "+8.2%", 
      icon: ShoppingBagIcon 
    },
    { 
      title: "Pending Orders", 
      value: dashboardData.pendingOrders.toString(), 
      change: "-2%", 
      icon: CubeIcon 
    },
    { 
      title: "Month Revenue", 
      value: formatCurrency(dashboardData.monthRevenue), 
      change: "+15.3%", 
      icon: ChartBarIcon 
    },
  ];

  const recentOrders = dashboardData.recentOrders.map(order => ({
    id: order.id,
    date: new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    customer: order.customer,
    payment: order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid',
    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
    total: formatCurrency(order.total)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Error loading dashboard</h3>
        <p className="text-gray-500 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h2>
        <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-72 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-sm">Chart visualization would appear here</p>
              <p className="text-xs text-gray-400 mt-1">Total Orders: {formatNumber(dashboardData.totalOrders)} | Month Revenue: {formatCurrency(dashboardData.monthRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Summary</h3>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-gray-600">Today's Revenue</span>
              <span className="text-lg font-semibold text-gray-900">{formatCurrency(dashboardData.todayRevenue)}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-gray-600">Month Revenue</span>
              <span className="text-lg font-semibold text-gray-900">{formatCurrency(dashboardData.monthRevenue)}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-gray-600">Total Orders</span>
              <span className="text-lg font-semibold text-gray-900">{formatNumber(dashboardData.totalOrders)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Orders</span>
              <span className="text-lg font-semibold text-gray-900">{dashboardData.pendingOrders}</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveSection('finances')}
            className="mt-6 w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            View Financial Report
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <button 
            onClick={() => setActiveSection('view-orders')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 font-medium text-gray-500">Date</th>
                <th className="text-left py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 font-medium text-gray-500">Payment</th>
                <th className="text-left py-3 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 font-medium text-gray-500">Total</th>
                 </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{order.id}</td>
                    <td className="py-3 text-gray-600">{order.date}</td>
                    <td className="py-3 text-gray-900">{order.customer}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Processing' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">{order.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales by Country */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Country</h3>
        
        <div className="space-y-5">
          {[
            { name: "United States", percentage: 80, sales: "$23,450" },
            { name: "United Kingdom", percentage: 65, sales: "$18,230" },
            { name: "Germany", percentage: 52, sales: "$14,890" },
            { name: "Canada", percentage: 45, sales: "$12,560" },
            { name: "Australia", percentage: 38, sales: "$9,870" },
          ].map((country, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-900">{country.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{country.sales}</span>
                  <span className="text-gray-700 font-medium w-12 text-right">{country.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;