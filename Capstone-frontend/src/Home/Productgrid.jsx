import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productStore from '../slices/productSlice';

const ProductGrid = () => {
  const { products, fetchProducts, loading, error } = productStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'herb-seeds', label: 'Herb Seeds' },
    { value: 'flower-seeds', label: 'Flower Seeds' },
    { value: 'garden-pots', label: 'Garden Pots' },
    { value: 'garden-books', label: 'Garden Books' },
    { value: 'digital-guides', label: 'Digital Guides' },
  ];

  // Fetch products when component mounts or category changes
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [fetchProducts, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Get only first 4 products for display
  const displayProducts = products.slice(0, 4);

  // Handle loading state
  if (loading && products.length === 0) {
    return (
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading products: {error}</p>
            <button
              onClick={() => fetchProducts(selectedCategory)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header - Left Aligned matching Hero and Productfeature */}
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Featured Products
          </h2>
          <p className="mt-3 text-gray-500">
            Discover our collection of high-quality seeds, pots, and gardening supplies
          </p>
        </div>

        {/* Category Filter Pills - Left Aligned */}
        <div className="flex flex-wrap gap-3 mt-8 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid - Square Images */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {displayProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="group"
                >
                  {/* Square Image - 1:1 Aspect Ratio */}
                  <div className="relative w-full pt-[100%] overflow-hidden rounded-lg bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].altText || product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mt-4">
                    {/* Category Badge */}
                    <span className="inline-block px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full mb-2">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </span>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {product.shortDescription || product.description?.substring(0, 80)}
                    </p>

                    {/* Price */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xl font-bold text-indigo-600">
                        ${product.price.toFixed(2)}
                      </span>
                      {!product.inStock && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Shop All Button */}
            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Shop All Products
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;