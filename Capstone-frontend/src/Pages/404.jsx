import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";

// Import product images (using the same imports as Productlist)
import lavender from '../assets/Productlist Images/Lavendar.jpg';
import tulips from '../assets/Productlist Images/Tulips.jpg';
import sage from '../assets/Productlist Images/Sage.jpg';
import redBegonia from '../assets/Productlist Images/Redbegonia.jpg';
import herbs from '../assets/Productlist Images/Herbs.jpg';
import cilantro from '../assets/Productlist Images/Cilantro.jpg';
import bluePaintedPot from '../assets/Productlist Images/Bluepaintedpot.jpg';
import pinkPaintedPot from '../assets/Productlist Images/Pinkpaintedpot.jpg';

function NotFound() {
  // Garden products for the decorative grid - not greyed out
  const gardenProducts = [
    { src: lavender, alt: "Lavender plant", name: "Lavender" },
    { src: tulips, alt: "Tulip flowers", name: "Tulips" },
    { src: sage, alt: "Sage plant", name: "Sage" },
    { src: redBegonia, alt: "Red begonia", name: "Begonia" },
    { src: herbs, alt: "Fresh herbs", name: "Herbs Bundle" },
    { src: cilantro, alt: "Cilantro", name: "Cilantro" },
    { src: bluePaintedPot, alt: "Blue pot", name: "Blue Pot" },
    { src: pinkPaintedPot, alt: "Pink pot", name: "Pink Pot" }
  ];

  return (
    <>
      <Navbar />
      
      {/* Main 404 Section */}
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            {/* Large 404 with garden theme */}
            <div className="relative inline-block">
              <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">
                404
              </h1>
              {/* Decorative leaf elements */}
              <div className="absolute -top-6 -right-6 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
                🌿
              </div>
              <div className="absolute -bottom-6 -left-6 text-6xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                🌱
              </div>
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Page Not Found
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Looks like this page has been transplanted! The product you're looking for 
              might be in a different garden bed.
            </p>
            
            {/* Garden Products Grid - decorative but not greyed out */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {gardenProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <img 
                    src={product.src} 
                    alt={product.alt}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">{product.name}</p>
                </div>
              ))}
            </div>

            {/* Suggested links */}
            <div className="mt-12 space-y-4">
              <p className="text-gray-600">Try exploring these sections instead:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                  ← Back to Home
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 border border-green-300 text-base font-medium rounded-lg shadow-sm text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                  Browse All Products
                </Link>
                <Link
                  to="/guides"
                  className="inline-flex items-center px-6 py-3 border border-green-300 text-base font-medium rounded-lg shadow-sm text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                  Gardening Guides
                </Link>
              </div>
            </div>

            {/* Search suggestion */}
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Or try searching for what you need in our product catalog
              </p>
              <Link 
                to="/products" 
                className="inline-block mt-2 text-green-600 hover:text-green-800 font-medium underline"
              >
                View All Products →
              </Link>
            </div>

            {/* Garden quote */}
            <div className="mt-16 max-w-2xl mx-auto border-t border-green-200 pt-8">
              <p className="text-sm text-gray-500 italic">
                "Every gardener knows that sometimes seeds get misplaced. Let's help you find what you're looking for."
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;