import React, { useState, useMemo, useEffect } from "react";
import { FunnelIcon } from '@heroicons/react/24/outline';
import { Link, useSearchParams } from 'react-router-dom';
import productStore from '../slices/productSlice';

const sortOptions = [
  { name: 'Most Popular', value: 'popular' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
  { name: 'Newest', value: 'newest' },
];

const filters = [
  {
    id: 'category',
    name: 'Category',
    options: [
      { value: 'herb-seeds', label: 'Herb Seeds', checked: false },
      { value: 'flower-seeds', label: 'Flower Seeds', checked: false },
      { value: 'garden-pots', label: 'Garden Pots', checked: false },
      { value: 'garden-books', label: 'Garden Books', checked: false },
      { value: 'digital-guides', label: 'Digital Guides', checked: false },
    ],
  },
  {
    id: 'price',
    name: 'Price Range',
    options: [
      { value: '1to5.99', label: '$1 - $5.99', checked: false },
      { value: '6to10.99', label: '$6 - $10.99', checked: false },
      { value: '11to24.99', label: '$11 - $24.99', checked: false },
      { value: 'over25', label: 'Over $25', checked: false },
    ],
  },
];

export default function ProductList() {
  // Use your product store
  const { products, loading, error, fetchProducts } = productStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    price: []
  });

  // Get search query from URL and stabilize it with useState
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search'));

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper function to get display title based on selected filters and search
  const getPageTitle = () => {
    // If there's a search query, show search results title
    if (searchQuery && searchQuery.trim()) {
      return `Search results for "${searchQuery}"`;
    }
    
    const selectedCategories = selectedFilters.category;
    const selectedPrices = selectedFilters.price;
    
    // No filters selected
    if (selectedCategories.length === 0 && selectedPrices.length === 0) {
      return 'All Products';
    }
    
    // Build title parts
    const titleParts = [];
    
    // Add category part
    if (selectedCategories.length > 0) {
      const categoryLabels = selectedCategories.map(cat => {
        switch(cat) {
          case 'herb-seeds': return 'Herb Seeds';
          case 'flower-seeds': return 'Flower Seeds';
          case 'garden-pots': return 'Garden Pots';
          case 'garden-books': return 'Garden Books';
          case 'digital-guides': return 'Digital Guides';
          default: return cat;
        }
      });
      
      if (categoryLabels.length === 1) {
        titleParts.push(categoryLabels[0]);
      } else {
        titleParts.push('Multiple Categories');
      }
    }
    
    // Add price part
    if (selectedPrices.length > 0) {
      const priceLabels = selectedPrices.map(price => {
        switch(price) {
          case '1to5.99': return '$1 - $5.99';
          case '6to10.99': return '$6 - $10.99';
          case '11to24.99': return '$11 - $24.99';
          case 'over25': return 'Over $25';
          default: return price;
        }
      });
      
      if (priceLabels.length === 1) {
        titleParts.push(priceLabels[0]);
      } else {
        titleParts.push('Multiple Price Ranges');
      }
    }
    
    // Combine title parts
    return titleParts.join(' • ');
  };

  // Filter products based on selected category filters AND search query
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply search query filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filters
    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.category.includes(product.category)
      );
    }
    
    // Apply price range filters
    if (selectedFilters.price.length > 0) {
      filtered = filtered.filter(product => {
        return selectedFilters.price.some(range => {
          switch(range) {
            case '1to5.99':
              return product.price >= 1 && product.price <= 5.99;
            case '6to10.99':
              return product.price >= 6 && product.price <= 10.99;
            case '11to24.99':
              return product.price >= 11 && product.price <= 24.99;
            case 'over25':
              return product.price > 25;
            default:
              return true;
          }
        });
      });
    }
    
    return filtered;
  }, [products, selectedFilters, searchQuery]);

  // Sort the filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch(selectedSort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
  }, [filteredProducts, selectedSort]);

  const productsPerPage = 8;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleFilterChange = (filterId, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: prev[filterId].includes(value)
        ? prev[filterId].filter(v => v !== value)
        : [...prev[filterId], value]
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (e) => {
    setSelectedSort(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get primary image URL (first image from Cloudinary)
  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    // Fallback placeholder
    return 'https://via.placeholder.com/300';
  };

  const pageTitle = getPageTitle();

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-red-600">Error loading products: {error}</p>
          <button
            onClick={() => fetchProducts()}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with dynamic title and sort */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            {/* Show active filter summary for mobile */}
            {(selectedFilters.category.length > 0 || selectedFilters.price.length > 0 || searchQuery) && (
              <p className="mt-1 text-sm text-gray-500">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              name="sort"
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedSort}
              onChange={handleSortChange}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedFilters.category.length > 0 || selectedFilters.price.length > 0 || searchQuery) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            
            {/* Search query filter */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Search: "{searchQuery}"
                <Link
                  to="/products"
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                  aria-label="Clear search"
                >
                  ×
                </Link>
              </span>
            )}
            
            {/* Category filters */}
            {selectedFilters.category.map(cat => {
              const label = filters[0].options.find(opt => opt.value === cat)?.label;
              return (
                <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {label}
                  <button
                    onClick={() => handleFilterChange('category', cat)}
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                    aria-label={`Remove ${label} filter`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            
            {/* Price filters */}
            {selectedFilters.price.map(price => {
              const label = filters[1].options.find(opt => opt.value === price)?.label;
              return (
                <span key={price} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {label}
                  <button
                    onClick={() => handleFilterChange('price', price)}
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                    aria-label={`Remove ${label} filter`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
            
            {/* Clear all button */}
            {(selectedFilters.category.length > 0 || selectedFilters.price.length > 0 || searchQuery) && (
              <Link
                to="/products"
                onClick={() => setSelectedFilters({ category: [], price: [] })}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </Link>
            )}
          </div>
        )}

        <div className="pt-6 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block">
            <h2 className="sr-only">Filters</h2>
            
            {filters.map((section) => (
              <div key={section.id} className="border-b border-gray-200 py-6">
                <h3 className="text-sm font-medium text-gray-900">{section.name}</h3>
                <div className="mt-4 space-y-4">
                  {section.options.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`filter-${section.id}-${option.value}`}
                        name={`${section.id}[]`}
                        value={option.value}
                        type="checkbox"
                        checked={selectedFilters[section.id].includes(option.value)}
                        onChange={() => handleFilterChange(section.id, option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`filter-${section.id}-${option.value}`}
                        className="ml-3 text-sm text-gray-600"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {(selectedFilters.category.length > 0 || selectedFilters.price.length > 0) && (
                <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                  {selectedFilters.category.length + selectedFilters.price.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile filter drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div className="fixed inset-0 bg-black/25" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative ml-auto h-full w-full max-w-xs bg-white py-4 pb-12 shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 px-4">
                  {filters.map((section) => (
                    <div key={section.id} className="border-b border-gray-200 py-6">
                      <h3 className="text-sm font-medium text-gray-900">{section.name}</h3>
                      <div className="mt-4 space-y-4">
                        {section.options.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`mobile-filter-${section.id}-${option.value}`}
                              name={`${section.id}[]`}
                              value={option.value}
                              type="checkbox"
                              checked={selectedFilters[section.id].includes(option.value)}
                              onChange={() => {
                                handleFilterChange(section.id, option.value);
                                setMobileFiltersOpen(false);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`mobile-filter-${section.id}-${option.value}`}
                              className="ml-3 text-sm text-gray-600"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product grid with Cloudinary images */}
          <div className="lg:col-span-3">
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {currentProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="group"
                  >
                    <img
                      alt={product.name}
                      src={getPrimaryImage(product)}
                      loading="lazy"
                      className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8 transition duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                      }}
                    />
                    <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products match the selected filters or search.</p>
                <Link
                  to="/products"
                  onClick={() => setSelectedFilters({ category: [], price: [] })}
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear all filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {sortedProducts.length > 0 && (
              <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastProduct, sortedProducts.length)}
                      </span>{' '}
                      of <span className="font-medium">{sortedProducts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          aria-current={currentPage === index + 1 ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === index + 1
                              ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}