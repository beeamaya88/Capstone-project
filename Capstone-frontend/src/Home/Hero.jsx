import React from "react";
import { useNavigate } from "react-router-dom";

// CORRECTED PATHS - go up one level with ../
import Rosemary from "../assets/Hero Images/Rosemary.jpg";

// Pick ONE image to use as the background
const heroImage = Rosemary;

export default function Hero() {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate("/products");
  };

  const handleLearnMore = () => {
    navigate("/about");
  };

  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative overflow-hidden bg-white min-h-screen">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>

      {/* Optional dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-md">
              We're changing the way people connect with soil
            </h1>

            <p className="mt-6 text-lg leading-8 text-white drop-shadow-md">
              We believe wellness begins beneath our feet. Whether you're a seasoned 
              grower or beginner, reconnect with the earth through mindful gardening. 
              Shop organically grown, non-GMO seeds, hand-painted pottery, and 
              explore our beginner-friendly guides.
            </p>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={handleShopNow}
                className="rounded-md bg-indigo-600 px-8 py-4 text-white font-medium hover:bg-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Shop now
              </button>

              <button 
                onClick={handleLearnMore}
                className="rounded-md bg-black px-8 py-4 text-white font-medium hover:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Learn more
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Animated Plant Scroll Indicator - Moved UP from bottom-8 to bottom-24 */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10">
        <button 
          onClick={scrollDown}
          aria-label="Scroll down to explore more"
          className="group flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full p-2"
        >
          {/* Plant icon that grows and shrinks */}
          <div className="animate-bounce-slow">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V15c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c1.46 0 2.8.6 3.73 1.53L12 8.59V4zm-4 5c0-2.21 1.79-4 4-4h1v5.59l-3.73-3.73C10.4 6.6 11 5.46 11 4h-1c-1.66 0-3 1.34-3 3h1zm6 6H9v-1.46c.95.3 1.98.46 3 .46s2.05-.16 3-.46V15z"/>
            </svg>
          </div>
          
          {/* Growing line/stem with leaves */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-white/60 group-hover:bg-white animate-grow"></div>
            <div className="relative">
              <div className="absolute -top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full group-hover:bg-white animate-pulse"></div>
              <div className="absolute -top-1 right-1 w-1.5 h-1.5 bg-white/60 rounded-full group-hover:bg-white animate-pulse delay-150"></div>
            </div>
          </div>
          
          <span className="text-xs font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            SCROLL
          </span>
        </button>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(10%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes grow {
          0% {
            height: 0;
          }
          50% {
            height: 1.5rem;
          }
          100% {
            height: 1.5rem;
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        
        .animate-grow {
          animation: grow 2s infinite;
        }
      `}</style>

    </div>
  );
}