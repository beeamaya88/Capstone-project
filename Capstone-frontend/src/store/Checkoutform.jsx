import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, TruckIcon, CreditCardIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getStripe } from '../utils/stripe';
import userStore from '../slices/userSlice';
import cartStore from '../slices/cartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = userStore();
  const { 
    items: cartItems, 
    loading: cartLoading, 
    error: cartError, 
    fetchCart,
    subtotal: cartSubtotal
  } = cartStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=checkout');
    }
  }, [user, navigate]);

  // Fetch cart when user is available
  useEffect(() => {
    if (user) {
      fetchCart(user.id);
    }
  }, [user, fetchCart]);

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    country: 'United States',
    state: '',
    postalCode: '',
    phone: '',
    deliveryMethod: 'standard',
    paymentMethod: 'credit-card',
    sameAsShipping: true,
    // Billing address fields (only used when sameAsShipping is false)
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress: '',
    billingApartment: '',
    billingCity: '',
    billingCountry: 'United States',
    billingState: '',
    billingPostalCode: '',
    billingPhone: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  // Track if billing section is expanded
  const [billingExpanded, setBillingExpanded] = useState(false);
  // Loading state for payment
  const [isProcessing, setIsProcessing] = useState(false);
  // Payment error message
  const [paymentError, setPaymentError] = useState('');

  // Update email when user loads
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Shipping info validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';

    // Billing info validation (if not same as shipping)
    if (!formData.sameAsShipping) {
      if (!formData.billingFirstName) newErrors.billingFirstName = 'First name is required';
      if (!formData.billingLastName) newErrors.billingLastName = 'Last name is required';
      if (!formData.billingAddress) newErrors.billingAddress = 'Address is required';
      if (!formData.billingCity) newErrors.billingCity = 'City is required';
      if (!formData.billingState) newErrors.billingState = 'State is required';
      if (!formData.billingPostalCode) newErrors.billingPostalCode = 'Postal code is required';
    }

    return newErrors;
  };

  // Calculations
  const subtotal = cartSubtotal || 0;
  const shipping = formData.deliveryMethod === 'express' ? 16.00 : 5.00;
  const tax = subtotal * 0.13; // 13% tax example
  const total = subtotal + shipping + tax;

  // Toggle billing section
  const toggleBilling = () => {
    setBillingExpanded(!billingExpanded);
  };

  const makePayment = async () => {
    try {
      // Clear any previous errors
      setPaymentError('');
      
      // First validate the form
      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Scroll to first error
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
        return;
      }

      // Check if cart is empty
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }

      setIsProcessing(true);


      //Prepare order data for storage
       const orderData = {
      userId: user.id,
      items: cartItems.map(item => ({
        productId: item._id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedAmount: item.selectedAmount,
        imageUrl: item.imageUrl,
        category: item.category
      })),
      shippingDetails: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        line1: formData.address,
        line2: formData.apartment || '',
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country === 'United States' ? 'US' : 
                 formData.country === 'Canada' ? 'CA' : 'US',
        phone: formData.phone
      },
      billingDetails: formData.sameAsShipping ? null : {
        name: `${formData.billingFirstName} ${formData.billingLastName}`,
        line1: formData.billingAddress,
        line2: formData.billingApartment || '',
        city: formData.billingCity,
        state: formData.billingState,
        postal_code: formData.billingPostalCode,
        country: formData.billingCountry === 'United States' ? 'US' : 
                 formData.billingCountry === 'Canada' ? 'CA' : 'US',
        phone: formData.billingPhone
      },
      subtotal,
      shipping,
      tax,
      total,
      deliveryMethod: formData.deliveryMethod
    };

    // Store in sessionStorage
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
    console.log('Order data saved to sessionStorage:', orderData);


      // Get Stripe instance from utility with error handling
     
      try {
        await getStripe();
      } catch (stripeError) {
        console.error('Stripe initialization failed:', stripeError);
        setPaymentError('Payment system is not configured properly. Please check your .env file and restart the server.');
        setIsProcessing(false);
        return;
      }
      
      // Prepare the line items for checkout
      const lineItems = cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      }));

      // Prepare the request body
      const body = {
        lineItems,
        customerEmail: formData.email,
        userId: user.id,
        shippingDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: {
            line1: formData.address,
            line2: formData.apartment || '',
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country === 'United States' ? 'US' : 
                     formData.country === 'Canada' ? 'CA' : 'US',
          },
          phone: formData.phone,
        },
        billingDetails: formData.sameAsShipping ? null : {
          name: `${formData.billingFirstName} ${formData.billingLastName}`,
          address: {
            line1: formData.billingAddress,
            line2: formData.billingApartment || '',
            city: formData.billingCity,
            state: formData.billingState,
            postal_code: formData.billingPostalCode,
            country: formData.billingCountry === 'United States' ? 'US' : 
                     formData.billingCountry === 'Canada' ? 'CA' : 'US',
          },
          phone: formData.billingPhone,
        },
        shippingMethod: formData.deliveryMethod,
        total: Math.round(total * 100)
      };

      // Make the API call to your backend
      const API_URL = 'http://localhost:3500';
      
      let response;
      try {
        response = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
      } catch (networkError) {
        console.error('Network error:', networkError);
        setPaymentError('Cannot connect to payment server. Please make sure the backend is running on port 3500.');
        setIsProcessing(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Payment failed with status ${response.status}`);
      }

      const session = await response.json();
      
      if (!session.id) {
        throw new Error('No session ID received from server');
      }

      // Redirect to Stripe Checkout
            // Redirect to the Stripe Checkout URL
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (cartError) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading cart</div>
            <p className="text-gray-600 mb-4">{cartError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Link
              to="/products"
              className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Complete your order in one simple step
          </p>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Checkout Form - Left Column */}
          <div className="lg:col-span-7">
            <div className="space-y-8">
              {/* Contact Information */}
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact information</h2>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </section>

              {/* Shipping Information */}
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full rounded-md border ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                    Apartment, suite, etc. <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`w-full rounded-md border ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </section>

              {/* Billing Information - Collapsible Section */}
              <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header with checkbox and toggle */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-base font-medium text-gray-900">
                        Billing address is the same as shipping
                      </span>
                    </label>
                    
                    {!formData.sameAsShipping && (
                      <button
                        type="button"
                        onClick={toggleBilling}
                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        aria-expanded={billingExpanded}
                      >
                        {billingExpanded ? (
                          <>Hide billing details <ChevronUpIcon className="h-4 w-4" /></>
                        ) : (
                          <>Enter billing details <ChevronDownIcon className="h-4 w-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Billing Form - Only shown when sameAsShipping is false */}
                {!formData.sameAsShipping && (
                  <div className={`transition-all duration-300 ease-in-out ${
                    billingExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}>
                    <div className="p-6 space-y-4">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Billing Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="billingFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First name
                          </label>
                          <input
                            type="text"
                            id="billingFirstName"
                            name="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border ${
                              errors.billingFirstName ? 'border-red-500' : 'border-gray-300'
                            } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          />
                          {errors.billingFirstName && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingFirstName}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingLastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last name
                          </label>
                          <input
                            type="text"
                            id="billingLastName"
                            name="billingLastName"
                            value={formData.billingLastName}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border ${
                              errors.billingLastName ? 'border-red-500' : 'border-gray-300'
                            } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          />
                          {errors.billingLastName && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingLastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="billingAddress"
                          name="billingAddress"
                          value={formData.billingAddress}
                          onChange={handleInputChange}
                          className={`w-full rounded-md border ${
                            errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                          } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                        />
                        {errors.billingAddress && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="billingCity"
                            name="billingCity"
                            value={formData.billingCity}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border ${
                              errors.billingCity ? 'border-red-500' : 'border-gray-300'
                            } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          />
                          {errors.billingCity && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            id="billingState"
                            name="billingState"
                            value={formData.billingState}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border ${
                              errors.billingState ? 'border-red-500' : 'border-gray-300'
                            } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          />
                          {errors.billingState && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingState}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Postal code
                          </label>
                          <input
                            type="text"
                            id="billingPostalCode"
                            name="billingPostalCode"
                            value={formData.billingPostalCode}
                            onChange={handleInputChange}
                            className={`w-full rounded-md border ${
                              errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
                            } px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                          />
                          {errors.billingPostalCode && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <select
                            id="billingCountry"
                            name="billingCountry"
                            value={formData.billingCountry}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option>United States</option>
                            <option>Canada</option>
                            <option>Mexico</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Delivery Method */}
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.deliveryMethod === 'standard' 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="standard"
                        checked={formData.deliveryMethod === 'standard'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <TruckIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Standard</p>
                          <p className="text-sm text-gray-500">4–10 business days</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$5.00</span>
                  </label>

                  <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.deliveryMethod === 'express' 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="express"
                        checked={formData.deliveryMethod === 'express'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <TruckIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Express</p>
                          <p className="text-sm text-gray-500">2–5 business days</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$16.00</span>
                  </label>
                </div>
              </section>

              {/* Payment Method Selection */}
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment method</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === 'credit-card' 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      Credit Card (via Stripe)
                    </span>
                  </label>

                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      You'll be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                  </div>

                  {/* Payment Error Display */}
                  {paymentError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800">Payment Error</p>
                      <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Security note */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                <span>Your payment information is secure and encrypted by Stripe</span>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order summary</h2>
              
              {/* Cart items */}
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item._id} className="py-4 flex">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/112'}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/112';
                          }}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Qty {item.quantity}
                              {item.selectedAmount && ` • ${item.selectedAmount}`}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Shipping</dt>
                    <dd className="text-sm font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Tax (13%)</dt>
                    <dd className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={makePayment}
                type="button"
                disabled={isProcessing || cartLoading}
                className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Buy Now • $${total.toFixed(2)}`}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                By placing your order, you agree to our{' '}
                <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;