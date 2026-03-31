import React, { useState, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import productStore from '../slices/productSlice';
import categoryStore from '../slices/categorySlice';

const AdminAddProduct = () => {
  // Get product store actions and state
  const { addProduct, loading: productLoading, error, clearError } = productStore();
  
  // Get category store actions and state
  const { categories, fetchCategories, loading: categoriesLoading } = categoryStore();

  const [productData, setProductData] = useState({
    name: '',
    category: 'herb-seeds',
    price: '',
    description: '',
    inStock: true,
    features: [''],
    seedAmounts: [
      { amount: '100', multiplier: 1, enabled: true },
      { amount: '200', multiplier: 1.7, enabled: true },
      { amount: '300', multiplier: 2.2, enabled: true },
    ],
    maxQuantity: 10,
    potSize: '',
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [announcement, setAnnouncement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle errors from product store
  useEffect(() => {
    if (error) {
      announceToScreenReader(`Error: ${error}`);
      alert(`Error adding product: ${error}`);
      clearError();
    }
  }, [error, clearError]);

  // Use categories from store, fallback to hardcoded if none
  const categoryOptions = categories.length > 0 ? categories : [
    { value: 'herb-seeds', label: 'Herb Seeds' },
    { value: 'flower-seeds', label: 'Flower Seeds' },
    { value: 'garden-pots', label: 'Garden Pots' },
    { value: 'garden-books', label: 'Garden Books' },
    { value: 'digital-guides', label: 'Digital Guides' },
  ];

  const isSeedProduct = productData.category === 'herb-seeds' || productData.category === 'flower-seeds';
  const isPotProduct = productData.category === 'garden-pots';

  // Announce messages to screen readers
  const announceToScreenReader = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price' && value < 0) {
      announceToScreenReader('Price cannot be negative');
      return;
    }
    
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      announceToScreenReader(`Error cleared for ${name}`);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...productData.features];
    newFeatures[index] = value;
    setProductData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setProductData(prev => ({ ...prev, features: [...prev.features, ''] }));
    announceToScreenReader('New feature field added');
  };

  const removeFeature = (index) => {
    if (productData.features.length > 1) {
      const newFeatures = productData.features.filter((_, i) => i !== index);
      setProductData(prev => ({ ...prev, features: newFeatures }));
      announceToScreenReader(`Feature ${index + 1} removed`);
    }
  };

  const handleSeedAmountChange = (index, field, value) => {
    const newAmounts = [...productData.seedAmounts];
    newAmounts[index] = { ...newAmounts[index], [field]: value };
    setProductData(prev => ({ ...prev, seedAmounts: newAmounts }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
    announceToScreenReader(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
  };

  const removeImage = (index) => {
    const imageName = images[index].name;
    // Clean up the object URL to prevent memory leaks
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
    announceToScreenReader(`Image ${imageName} removed`);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!productData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!productData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(productData.price) || parseFloat(productData.price) <= 0) {
      newErrors.price = 'Price must be a positive number greater than 0';
    }

    if (!productData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    if (isPotProduct && !productData.potSize.trim()) {
      newErrors.potSize = 'Pot size is required';
    }

    const hasValidFeature = productData.features.some(f => f.trim() !== '');
    if (!hasValidFeature) {
      newErrors.features = 'At least one feature is required';
    }

    if (isSeedProduct && !productData.seedAmounts.some(a => a.enabled)) {
      newErrors.seedAmounts = 'At least one seed amount option must be enabled';
    }

    return newErrors;
  };

  const resetForm = () => {
    setProductData({
      name: '',
      category: 'herb-seeds',
      price: '',
      description: '',
      inStock: true,
      features: [''],
      seedAmounts: [
        { amount: '100', multiplier: 1, enabled: true },
        { amount: '200', multiplier: 1.7, enabled: true },
        { amount: '300', multiplier: 2.2, enabled: true },
      ],
      maxQuantity: 10,
      potSize: '',
    });
    
    // Clean up image previews
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setErrors({});
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const formData = new FormData();
        
        // Add all product data fields
        formData.append('name', productData.name);
        formData.append('category', productData.category);
        formData.append('price', productData.price);
        formData.append('description', productData.description);
        formData.append('inStock', productData.inStock);
        formData.append('maxQuantity', productData.maxQuantity);
        
        // Handle features array - only add non-empty features
        productData.features.forEach(feature => {
          if (feature.trim()) {
            formData.append('features', feature.trim());
          }
        });
        
        // Handle seed amounts if it's a seed product
        if (isSeedProduct) {
          formData.append('seedAmounts', JSON.stringify(productData.seedAmounts));
        }
        
        // Handle pot size if it's a pot product
        if (isPotProduct && productData.potSize) {
          formData.append('potSize', productData.potSize);
        }
        
        // Add images (files)
        images.forEach(image => {
          formData.append('productImages', image.file);
        });

        // ✅ Use the product slice to add product
        const result = await addProduct(formData);
        
        if (result.success) {
          setSubmitSuccess(true);
          announceToScreenReader('Product added successfully');
          alert('Product added successfully!');
          
          // Reset the form
          resetForm();
        }
        
      } catch (error) {
        console.error('Error adding product:', error);
        announceToScreenReader(`Error: ${error.message}`);
        alert(`Error adding product: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      // Announce first error to screen reader
      const firstError = Object.values(newErrors)[0];
      announceToScreenReader(`Validation error: ${firstError}`);
      
      // Focus first field with error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
    }
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
      announceToScreenReader('Negative numbers not allowed');
    }
  };

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Show loading state while categories are fetching
  if (categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    );
  }

  return (
    <>
      {/* Screen reader announcement region - visually hidden but accessible */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Success notification */}
      {submitSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          Product added successfully!
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with proper heading hierarchy */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-500">Fill in the details below to create a new product.</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-8"
          noValidate // Prevent browser validation so we can show custom errors
        >
          {/* Basic Information Card */}
          <section 
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            aria-labelledby="basic-info-heading"
          >
            <h2 id="basic-info-heading" className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-8">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Cilantro"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full rounded-xl border ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  } px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors`}
                  disabled={isSubmitting || productLoading}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Category as Box Buttons - with proper ARIA role */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-4">
                  Category <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" role="radiogroup">
                  {categoryOptions.map((cat) => {
                    const isSelected = productData.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => !isSubmitting && !productLoading && setProductData(prev => ({ ...prev, category: cat.value }))}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Select category: ${cat.label}`}
                        disabled={isSubmitting || productLoading}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        } ${isSubmitting || productLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Price with dollar sign OUTSIDE the text field */}
              <div className="max-w-xs">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-gray-700 text-lg font-medium bg-gray-100 px-3 py-3 rounded-xl border border-gray-200"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0.01"
                    value={productData.price}
                    onChange={handleInputChange}
                    onKeyDown={handlePriceKeyDown}
                    placeholder="0.00"
                    aria-required="true"
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? 'price-error' : 'price-hint'}
                    disabled={isSubmitting || productLoading}
                    className={`flex-1 rounded-xl border ${
                      errors.price ? 'border-red-300' : 'border-gray-200'
                    } px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors ${
                      isSubmitting || productLoading ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
                {errors.price ? (
                  <p id="price-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.price}
                  </p>
                ) : (
                  <p id="price-hint" className="mt-1 text-xs text-gray-400">
                    Enter a price (minimum $0.01)
                  </p>
                )}
              </div>

              {/* In Stock Radio Buttons */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                  Stock Status <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </legend>
                <div className="flex items-center gap-6">
                  <label className={`flex items-center gap-2 ${isSubmitting || productLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="inStock"
                      value="true"
                      checked={productData.inStock === true}
                      onChange={() => setProductData(prev => ({ ...prev, inStock: true }))}
                      disabled={isSubmitting || productLoading}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className={`flex items-center gap-2 ${isSubmitting || productLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="inStock"
                      value="false"
                      checked={productData.inStock === false}
                      onChange={() => setProductData(prev => ({ ...prev, inStock: false }))}
                      disabled={isSubmitting || productLoading}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Out of Stock</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </section>

          {/* Seed-specific Card - with proper heading hierarchy */}
          {isSeedProduct && (
            <section 
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              aria-labelledby="seed-options-heading"
            >
              <h2 id="seed-options-heading" className="text-xl font-semibold text-gray-900 mb-6">Seed Options</h2>
              
              <div className="space-y-8">
                {/* Seed Amount Options */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4">
                    Seed Amount Options
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {productData.seedAmounts.map((amount, index) => (
                      <div
                        key={index}
                        className={`relative rounded-xl border-2 p-5 transition-all ${
                          amount.enabled 
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xl font-semibold text-gray-900">{amount.amount}</span>
                          <input
                            type="checkbox"
                            id={`seed-amount-${index}`}
                            checked={amount.enabled}
                            onChange={(e) => handleSeedAmountChange(index, 'enabled', e.target.checked)}
                            disabled={isSubmitting || productLoading}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            aria-label={`Enable ${amount.amount} seeds option`}
                          />
                        </div>
                        <p className="text-sm text-gray-500 mb-3">seeds</p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Price:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500" aria-hidden="true">$</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={amount.multiplier}
                              onChange={(e) => handleSeedAmountChange(index, 'multiplier', parseFloat(e.target.value))}
                              disabled={!amount.enabled || isSubmitting || productLoading}
                              aria-label={`Multiplier for ${amount.amount} seeds`}
                              className={`w-20 rounded-lg border ${
                                !amount.enabled ? 'bg-gray-100 border-gray-200' : 'border-gray-300'
                              } px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                            />
                          </div>
                          <span className="text-sm text-gray-500">x base</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.seedAmounts && (
                    <p className="mt-2 text-sm text-red-600" role="alert">{errors.seedAmounts}</p>
                  )}
                  <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                    <span aria-hidden="true">🌱</span> Check the box to enable each seed amount option
                  </p>
                </fieldset>

                {/* Maximum Quantity per Order */}
                <div className="max-w-xs">
                  <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum quantity per order
                  </label>
                  <input
                    type="number"
                    name="maxQuantity"
                    id="maxQuantity"
                    min="1"
                    max="100"
                    value={productData.maxQuantity}
                    onChange={handleInputChange}
                    disabled={isSubmitting || productLoading}
                    aria-describedby="max-quantity-hint"
                    className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                      isSubmitting || productLoading ? 'bg-gray-50' : ''
                    }`}
                  />
                  <p id="max-quantity-hint" className="mt-2 text-xs text-gray-400">
                    Maximum number of packs a customer can order
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Pot-specific Card */}
          {isPotProduct && (
            <section 
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              aria-labelledby="pot-details-heading"
            >
              <h2 id="pot-details-heading" className="text-xl font-semibold text-gray-900 mb-6">Pot Details</h2>
              
              <div className="max-w-xs">
                <label htmlFor="potSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Pot Size <span className="text-red-500" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  type="text"
                  name="potSize"
                  id="potSize"
                  value={productData.potSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 8&quot; diameter"
                  aria-required="true"
                  aria-invalid={!!errors.potSize}
                  aria-describedby={errors.potSize ? 'potSize-error' : undefined}
                  disabled={isSubmitting || productLoading}
                  className={`w-full rounded-xl border ${
                    errors.potSize ? 'border-red-300' : 'border-gray-200'
                  } px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                    isSubmitting || productLoading ? 'bg-gray-50' : ''
                  }`}
                />
                {errors.potSize && (
                  <p id="potSize-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.potSize}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Description Card */}
          <section 
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            aria-labelledby="description-heading"
          >
            <h2 id="description-heading" className="text-xl font-semibold text-gray-900 mb-6">Description</h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={productData.description}
                onChange={handleInputChange}
                placeholder="Write a compelling product description..."
                aria-required="true"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
                disabled={isSubmitting || productLoading}
                className={`w-full rounded-xl border ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                } px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                  isSubmitting || productLoading ? 'bg-gray-50' : ''
                }`}
              />
              {errors.description && (
                <p id="description-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
          </section>

          {/* Features Card */}
          <section 
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            aria-labelledby="features-heading"
          >
            <h2 id="features-heading" className="text-xl font-semibold text-gray-900 mb-6">Key Features</h2>
            
            <div className="space-y-4">
              {productData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label htmlFor={`feature-${index}`} className="sr-only">
                      Feature {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`feature-${index}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      disabled={isSubmitting || productLoading}
                      className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                        isSubmitting || productLoading ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>
                  {productData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={isSubmitting || productLoading}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Remove feature ${index + 1}`}
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFeature}
                disabled={isSubmitting || productLoading}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add another feature"
              >
                <span aria-hidden="true">+</span> Add another feature
              </button>
              
              {errors.features && (
                <p className="text-sm text-red-600" role="alert">{errors.features}</p>
              )}
            </div>
          </section>

          {/* Images Card */}
          <section 
            className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
            aria-labelledby="images-heading"
          >
            <h2 id="images-heading" className="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
            
            {/* Upload Area */}
            <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 hover:border-indigo-400 transition-colors">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                      isSubmitting || productLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onKeyDown={(e) => {
                      if (!isSubmitting && !productLoading && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        document.getElementById('file-upload')?.click();
                      }
                    }}
                    tabIndex={isSubmitting || productLoading ? -1 : 0}
                    role="button"
                  >
                    <PhotoIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Upload files
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                    disabled={isSubmitting || productLoading}
                    aria-label="Upload product images"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="h-24 w-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting || productLoading}
                        className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1.5 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Remove image ${image.name}`}
                      >
                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errors.images && (
              <p className="mt-4 text-sm text-red-600" role="alert">{errors.images}</p>
            )}
          </section>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting || productLoading}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || productLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting || productLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAddProduct;