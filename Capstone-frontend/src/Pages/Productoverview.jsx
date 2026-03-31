import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import productStore from '../slices/productSlice';
import cartStore from '../slices/cartSlice';
import userStore from '../slices/userSlice';

export default function ProductOverview() {
  const { id } = useParams();
  const [selectedAmount, setSelectedAmount] = useState("100");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  
  // Use your stores
  const { currentProduct, loading, error, fetchProductById } = productStore();
  const { user } = userStore();
  const { addToCart, loading: cartLoading } = cartStore();

  const MAX_QUANTITY = 10;

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
    window.scrollTo(0, 0);
  }, [id, fetchProductById]);

  // Get primary image URL (first image from Cloudinary)
  const getPrimaryImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }
    // Fallback placeholder
    return 'https://via.placeholder.com/500';
  };

  // Calculate price based on selected amount
  const getPriceForAmount = () => {
    if (!currentProduct) return '';
    
    const basePrice = currentProduct.price;
    let multiplier = 1;
    
    switch(selectedAmount) {
      case '100':
        multiplier = 1;
        break;
      case '200':
        multiplier = 1.7;
        break;
      case '300':
        multiplier = 2.2;
        break;
      default:
        multiplier = 1;
    }
    
    const calculatedPrice = (basePrice * multiplier).toFixed(2);
    return `$${calculatedPrice}`;
  };

  // Calculate total price based on amount and quantity
  const getTotalPrice = () => {
    if (!currentProduct) return '';
    
    const basePrice = currentProduct.price;
    let amountMultiplier = 1;
    
    switch(selectedAmount) {
      case '100':
        amountMultiplier = 1;
        break;
      case '200':
        amountMultiplier = 1.7;
        break;
      case '300':
        amountMultiplier = 2.2;
        break;
      default:
        amountMultiplier = 1;
    }
    
    const pricePerAmount = basePrice * amountMultiplier;
    const total = pricePerAmount * selectedQuantity;
    return `$${total.toFixed(2)}`;
  };

  // Handle quantity decrease with limit
  const decreaseQuantity = () => {
    setSelectedQuantity(prev => Math.max(1, prev - 1));
  };

  // Handle quantity increase with limit
  const increaseQuantity = () => {
    setSelectedQuantity(prev => Math.min(MAX_QUANTITY, prev + 1));
  };

  // Handle amount selection
  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    const result = await addToCart(user.id, {
      productId: currentProduct._id,
      quantity: selectedQuantity,
      selectedAmount: isSeedProduct ? selectedAmount : undefined
    });

    if (result.success) {
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    }
  };

  // Get category display name
  const getCategoryDisplay = (category) => {
    const categories = {
      'herb-seeds': 'Herb Seeds',
      'flower-seeds': 'Flower Seeds',
      'garden-pots': 'Garden Pots',
      'garden-books': 'Garden Books',
      'digital-guides': 'Digital Guides'
    };
    return categories[category] || category;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error or no product state
  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-600">{error || "The product you're looking for doesn't exist."}</p>
          <Link to="/products" className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Determine if this is a seed product
  const isSeedProduct = currentProduct.category === 'herb-seeds' || currentProduct.category === 'flower-seeds';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/products?category=${currentProduct.category}`} className="hover:text-indigo-600 transition">
            {getCategoryDisplay(currentProduct.category)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{currentProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT SIDE - Product Image */}
          <div className="bg-white rounded-3xl p-8 flex justify-center shadow-lg">
            <img
              src={getPrimaryImage(currentProduct)}
              alt={currentProduct.name}
              className="w-full max-h-[500px] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500';
              }}
            />
          </div>

          {/* RIGHT SIDE - Product Info */}
          <div>
            {/* Title and Category */}
            <div className="mb-4">
              <p className="text-sm text-indigo-600 font-medium mb-2">
                {getCategoryDisplay(currentProduct.category)}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {currentProduct.name}
              </h1>
            </div>

            {/* Price + Rating */}
            <div className="mt-4 flex items-center gap-4">
              <p className="text-3xl font-semibold text-gray-900">
                {isSeedProduct ? getPriceForAmount() : `$${currentProduct.price.toFixed(2)}`}
              </p>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(currentProduct.rating || 4.5) 
                        ? 'text-yellow-400' 
                        : star <= (currentProduct.rating || 4.5) 
                          ? 'text-yellow-300' 
                          : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.05 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
                  </svg>
                ))}

                <span className="ml-2 text-sm text-gray-500">
                  ({currentProduct.reviews || 0} reviews)
                </span>
              </div>
            </div>

            {/* Seed Count / Pot Size Info */}
            {isSeedProduct && currentProduct.seedCount && (
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Contents:</span> {currentProduct.seedCount}
              </p>
            )}
            
            {currentProduct.category === 'garden-pots' && currentProduct.potSize && (
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Size:</span> {currentProduct.potSize}
              </p>
            )}

            {/* Stock Status */}
            <div className="mt-6 flex items-center gap-2">
              {currentProduct.inStock ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-600 font-medium">In Stock</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {currentProduct.description}
              </p>
            </div>

            {/* Amount Selection - for seed products only */}
            {isSeedProduct && (
              <div className="mt-10">
                <h3 className="text-sm font-medium text-gray-900">Amount</h3>
                <p className="text-xs text-gray-500 mt-1">Select seed amount</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "100",
                      desc: "seeds",
                      price: `$${currentProduct.price.toFixed(2)}`,
                      multiplier: 1.0
                    },
                    {
                      label: "200",
                      desc: "seeds",
                      price: `$${(currentProduct.price * 1.7).toFixed(2)}`,
                      multiplier: 1.7
                    },
                    {
                      label: "300",
                      desc: "seeds",
                      price: `$${(currentProduct.price * 2.2).toFixed(2)}`,
                      multiplier: 2.2
                    },
                  ].map((amt) => {
                    const isSelected = selectedAmount === amt.label;

                    return (
                      <button
                        key={amt.label}
                        onClick={() => handleAmountSelect(amt.label)}
                        className={`rounded-xl border p-4 text-left transition
                          ${
                            isSelected
                              ? "border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                      >
                        <p className="text-xl font-semibold">{amt.label}</p>
                        <p className="text-sm text-gray-500">{amt.desc}</p>
                        <p className="mt-2 text-sm font-medium text-indigo-600">{amt.price}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  <span>🌱</span> Buy more, save more
                </p>
              </div>
            )}

            {/* Quantity Selection - for seed products only */}
            {isSeedProduct && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <p className="text-xs text-gray-500 mt-1">Number of packs (max {MAX_QUANTITY})</p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      disabled={selectedQuantity === 1}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-gray-900 font-medium border-x border-gray-300 min-w-[60px] text-center">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={selectedQuantity === MAX_QUANTITY}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total: <span className="font-semibold text-indigo-600">{getTotalPrice()}</span>
                  </p>
                </div>
                {selectedQuantity === MAX_QUANTITY && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <span>⚠️</span> Maximum quantity reached ({MAX_QUANTITY} packs)
                  </p>
                )}
              </div>
            )}

            {/* Features */}
            {currentProduct.features && currentProduct.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                <ul className="mt-4 space-y-2">
                  {currentProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Cart Button */}
            <button 
              disabled={!currentProduct.inStock || cartLoading}
              onClick={handleAddToCart}
              className={`mt-10 w-full rounded-xl py-4 text-white font-semibold shadow-lg transition ${
                currentProduct.inStock 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 cursor-pointer' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {cartLoading ? 'Adding...' : currentProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Success notification */}
            {addToCartSuccess && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center animate-fade-in">
                ✓ Added to cart successfully!
              </div>
            )}

            {/* Guarantee */}
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
              </svg>
              <span>30-Day Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}