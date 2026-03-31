import React, { useState, useMemo, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import productStore from '../slices/productSlice';

const categoryOptions = [
  { value: 'herb-seeds', label: 'Herb Seeds' },
  { value: 'flower-seeds', label: 'Flower Seeds' },
  { value: 'garden-pots', label: 'Garden Pots' },
  { value: 'garden-books', label: 'Garden Books' },
  { value: 'digital-guides', label: 'Digital Guides' },
];

const sortOptions = [
  { name: 'ID (Low to High)', value: 'id-asc' },
  { name: 'ID (High to Low)', value: 'id-desc' },
  { name: 'Name (A to Z)', value: 'name-asc' },
  { name: 'Name (Z to A)', value: 'name-desc' },
  { name: 'Price (Low to High)', value: 'price-asc' },
  { name: 'Price (High to Low)', value: 'price-desc' },
  { name: 'Most Popular', value: 'popular' },
  { name: 'Newest', value: 'newest' },
];

const AdminAllProducts = () => {
  // Use your product store instead of local state
  const { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    deleteProduct,
    updateProduct 
  } = productStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('id-asc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    inStock: true,
    seedCount: '',
    potSize: '',
  });

  const productsPerPage = 10;

  // Fetch products when component mounts or filters change
  useEffect(() => {
    fetchProducts(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm, fetchProducts]);

  // Announce to screen readers
  const announceToScreenReader = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  // Sort products (client-side sorting)
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch(selectedSort) {
      case 'id-asc':
        return sorted.sort((a, b) => a._id.localeCompare(b._id));
      case 'id-desc':
        return sorted.sort((a, b) => b._id.localeCompare(a._id));
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sorted;
    }
  }, [products, selectedSort]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle edit click
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditingProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      inStock: product.inStock,
      seedCount: product.seedCount || '',
      potSize: product.potSize || '',
    });
    setShowEditModal(true);
  };

  // Handle edit save - using your store
  const handleEditSave = async () => {
    const result = await updateProduct(selectedProduct._id, editingProduct);
    
    if (result.success) {
      setShowEditModal(false);
      setSelectedProduct(null);
      announceToScreenReader(`Product "${editingProduct.name}" updated successfully`);
    } else {
      announceToScreenReader(`Error updating product: ${result.error}`);
    }
  };

  // Handle delete click
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle delete confirm - using your store
  const handleDeleteConfirm = async () => {
    const result = await deleteProduct(selectedProduct._id);
    
    if (result.success) {
      setShowDeleteModal(false);
      setSelectedProduct(null);
      announceToScreenReader(`Product "${selectedProduct.name}" deleted successfully`);
    } else {
      announceToScreenReader(`Error deleting product: ${result.error}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get primary image URL (first image from Cloudinary)
  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    // Fallback placeholder
    return 'https://via.placeholder.com/40';
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">{announcement}</div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your product inventory. Total: <span className="font-medium">{products.length}</span> products
            </p>
          </div>
          {/* Add Product Button - Link to your AdminAddProduct */}
          <a
            href="/admin/products/add"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add New Product
          </a>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full rounded-xl border-0 py-3 pl-11 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
                  placeholder="Search by name, category, or description..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Category: {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 text-indigo-500 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-[5%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">ID</th>
                  <th scope="col" className="w-[8%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Image</th>
                  <th scope="col" className="w-[20%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Name</th>
                  <th scope="col" className="w-[12%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Category</th>
                  <th scope="col" className="w-[8%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Price</th>
                  <th scope="col" className="w-[8%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="w-[10%] px-4 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Date Added</th>
                  <th scope="col" className="w-[15%] px-4 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{product._id.slice(-6)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden">
                        <img 
                          src={getPrimaryImage(product)} 
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                        {categoryOptions.find(opt => opt.value === product.category)?.label || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
                          <XMarkIcon className="h-3 w-3" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                      >
                        <PencilIcon className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                  <span className="font-medium">{Math.min(indexOfLastProduct, sortedProducts.length)}</span>{' '}
                  of <span className="font-medium">{sortedProducts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all sm:w-full sm:max-w-2xl">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Edit Product - {selectedProduct.name}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                      className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="edit-category"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      rows="3"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                    />
                  </div>

                  {/* Stock Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={editingProduct.inStock === true}
                          onChange={() => setEditingProduct({...editingProduct, inStock: true})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">In Stock</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={editingProduct.inStock === false}
                          onChange={() => setEditingProduct({...editingProduct, inStock: false})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
                      </label>
                    </div>
                  </div>

                  {/* Conditional fields based on category */}
                  {(selectedProduct.category === 'herb-seeds' || selectedProduct.category === 'flower-seeds') && (
                    <div>
                      <label htmlFor="edit-seedCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Seed Count / Contents
                      </label>
                      <input
                        type="text"
                        id="edit-seedCount"
                        value={editingProduct.seedCount}
                        onChange={(e) => setEditingProduct({...editingProduct, seedCount: e.target.value})}
                        className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                        placeholder="e.g., approx. 150 seeds"
                      />
                    </div>
                  )}

                  {selectedProduct.category === 'garden-pots' && (
                    <div>
                      <label htmlFor="edit-potSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Pot Size
                      </label>
                      <input
                        type="text"
                        id="edit-potSize"
                        value={editingProduct.potSize}
                        onChange={(e) => setEditingProduct({...editingProduct, potSize: e.target.value})}
                        className="w-full rounded-xl border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 text-sm"
                        placeholder="e.g., 8&quot; diameter"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all sm:w-full sm:max-w-md">
              <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-center gap-4 text-amber-600 mb-4">
                  <ExclamationTriangleIcon className="h-8 w-8" />
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedProduct.name}"</span>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllProducts;