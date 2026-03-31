import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Signin from "./Components/Signin";
import Signup from "./Components/Signup";
import Footer from "./Components/Footer";
import Hero from "./Home/Hero";
import ProductGrid from "./Home/Productgrid";
import Productfeature from "./Home/Productfeature";
import ShoppingCart from "./store/Shoppingcart"; 
import ProductList from "./Pages/Productlist";
import Wishlist from "./Pages/Wishlist";
import ProductOverview from "./Pages/Productoverview";
import AdminAllProducts from "./Admin/Adminallproducts";
import AdminDashboard from "./Admin/Admindashboard";
import Checkout from "./store/Checkoutform"; 
import OrderSummary from "./store/Ordersummary";
import Account from "./store/Account";
import OrderDetails from './store/Orderdetails';

// Create placeholder components for missing routes
const About = () => <div className="min-h-screen pt-20 text-center text-2xl">About Page</div>;
const Contact = () => <div className="min-h-screen pt-20 text-center text-2xl">Contact Page</div>;
const Guides = () => <div className="min-h-screen pt-20 text-center text-2xl">Gardening Guides Page</div>;

export default function App() {
  const [modal, setModal] = useState(null); // null | "signin" | "signup"

  const openSignin = () => setModal("signin");
  const openSignup = () => setModal("signup");
  const closeModal = () => setModal(null);

  return (
    <>
      <Navbar openSignin={openSignin} openSignup={openSignup} />

      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <main>
              <Hero />
              <ProductGrid />
              <Productfeature />
            </main>
          }
        />
        
        {/* Products List Route */}
        <Route path="/products" element={<ProductList />} />
        
        {/* Product Overview with dynamic ID */}
        <Route path="/product/:id" element={<ProductOverview />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} /> 
        <Route path="/admin/products" element={<AdminAllProducts />} />
        
        {/* Other Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/cart" element={<ShoppingCart />} /> 
        <Route path="/cart/checkout" element={<Checkout />} /> 
        <Route path="/order-confirmation" element={<OrderSummary />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Account />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />
      </Routes>

      <Footer />

      {/* Signin Modal */}
      {modal === "signin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="relative z-50 w-full max-w-md p-6 bg-gray-900 rounded-lg text-white">
            <Signin 
              onSignupClick={openSignup} 
              onClose={closeModal}
            />
            <button
              onClick={closeModal}
              className="mt-6 block w-full text-center text-lg text-indigo-400 hover:text-indigo-300 font-medium focus:outline-2 focus:outline-indigo-500 cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {modal === "signup" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="relative z-50 w-full max-w-md p-6 bg-gray-900 rounded-lg text-white">
            <Signup 
              onSigninClick={openSignin} 
              onClose={closeModal}
            />
            <button
              onClick={closeModal}
              className="mt-6 block w-full text-center text-lg text-indigo-400 hover:text-indigo-300 font-medium focus:outline-2 focus:outline-indigo-500 cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}