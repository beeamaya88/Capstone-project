'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Popover, PopoverButton, PopoverGroup, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import userStore from '../slices/userSlice'
import cartStore from '../slices/cartSlice'

// Import local images
import organicSeeds from "../assets/Navigation Images/organicseeds.jpg"
import flowerPots from '../assets/Navigation Images/flowerpots.jpg'
import gardeningBook from '../assets/Navigation Images/gardeningbook.jpg'
import gardenLearner from '../assets/Navigation Images/gardenlearner.jpg'

// Import Root & Soil logo
import wildBudLogo from '../assets/Wildbud.svg'

// Logout Confirmation Modal Component
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Modal Content */}
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                {/* Warning Icon */}
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg 
                    className="h-6 w-6 text-red-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                    />
                  </svg>
                </div>
                
                {/* Text Content */}
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 
                    id="logout-modal-title" 
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Sign out
                  </h3>
                  <div className="mt-2">
                    <p className="text-base text-gray-500">
                      Are you sure you want to sign out? You'll need to sign in again to access your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const navigation = {
  categories: [
    {
      id: 'all-things-plants',
      name: 'All Things Plants',
      featured: [
        { name: 'Organic Seeds', href: '/products', imageSrc: organicSeeds, imageAlt: 'Organic Seeds' },
        { name: 'Flower Pots', href: '/products', imageSrc: flowerPots, imageAlt: 'Flower Pots' },
      ],
      sections: [
        {
          id: 'types',
          name: 'Seeds',
          items: [
            { name: 'Vegetables', href: '/products' },
            { name: 'Herbs', href: '/products' },
            { name: 'Indoor Flowers', href: '/products' },
            { name: 'Outdoor Flowers', href: '/products' },
          ],
        },
        {
          id: 'pottery',
          name: 'Pottery',
          items: [
            { name: 'Bowls', href: '/products' },
            { name: 'Mugs', href: '/products' },
            { name: 'Planters', href: '/products' },
            { name: 'Painted', href: '/products' },
            { name: 'Unpainted', href: '/products' },
          ],
        },
      ],
    },
    {
      id: 'guides',
      name: 'Gardening Guides',
      featured: [
        { name: 'Vintage Gardening Books', href: '/guides', imageSrc: gardeningBook, imageAlt: 'Gardening Book' },
        { name: 'Digital Beginner Guides', href: '/guides', imageSrc: gardenLearner, imageAlt: 'Garden Learner' },
      ],
      sections: [
        {
          id: 'resources',
          name: 'Guides & Resources',
          items: [
            { name: 'Starting Your First Garden', href: '/guides' },
            { name: 'Indoor Gardening', href: '/guides' },
            { name: 'Composting Basics', href: '/guides' },
            { name: 'Plant Care Tips', href: '/guides' },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
}

export default function Navbar({ openSignin, openSignup }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Get user state from userStore
  const { user, isAdmin, isLoggedIn, logout } = userStore()
  
  // Get cart state from cartStore
  const { itemCount, fetchCart } = cartStore()

  // Fetch cart when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchCart(user.id);
    }
  }, [isLoggedIn, user, fetchCart]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isLoggedIn && user) {
        fetchCart(user.id);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isLoggedIn, user, fetchCart]);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true)
  }

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    navigate("/");    
  }

  const handleCancelLogout = () => {
    setLogoutModalOpen(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  }

  return (
    <div className="bg-white">
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={logoutModalOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* HEADER */}
      <header className="relative bg-white">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Get free delivery on orders over $100
        </p>

        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* Mobile Menu Button - Visible on screens below lg (1024px) */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Logo - Root & Soil */}
              <div className="ml-4 flex lg:ml-0">
                <Link to="/">
                  <span className="sr-only">Root & Soil</span>
                  <img
                    src={wildBudLogo}
                    className="h-4 w-auto"
                    alt="Wild Bud Logo"
                  />
                </Link>
              </div>

              {/* DESKTOP NAVIGATION - Hidden on screens below lg (1024px) */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      {({ open }) => (
                        <>
                          <div className="relative flex">
                            <PopoverButton
                              className={`relative flex items-center text-sm font-medium text-gray-700 hover:text-gray-800 ${
                                open ? 'text-indigo-600' : ''
                              }`}
                            >
                              {category.name}
                              <span
                                className={`absolute inset-x-0 -bottom-px h-0.5 ${
                                  open ? 'bg-indigo-600' : 'bg-transparent'
                                }`}
                              />
                            </PopoverButton>
                          </div>

                          <Popover.Panel className="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500 shadow-lg">
                            <div className="relative bg-white">
                              <div className="mx-auto max-w-7xl px-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                  <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                    {category.featured.map((item) => (
                                      <div key={item.name} className="group relative text-base sm:text-sm">
                                        <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                          <img
                                            src={item.imageSrc}
                                            alt={item.imageAlt}
                                            className="object-cover object-center"
                                          />
                                        </div>
                                        <Link to={item.href} className="mt-6 block font-medium text-gray-900">
                                          <span className="absolute inset-0 z-10" />
                                          {item.name}
                                        </Link>
                                        <p aria-hidden="true" className="mt-1">
                                          Shop now
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                    {category.sections.map((section) => (
                                      <div key={section.name}>
                                        <p className="font-medium text-gray-900">{section.name}</p>
                                        <ul className="mt-6 space-y-6">
                                          {section.items.map((item) => (
                                            <li key={item.name} className="flex">
                                              <Link to={item.href} className="text-gray-500 hover:text-gray-600">
                                                {item.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Popover.Panel>
                        </>
                      )}
                    </Popover>
                  ))}
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      to={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              {/* DESKTOP RIGHT SIDE - Hidden on screens below lg (1024px) */}
              <div className="hidden lg:flex ml-auto items-center space-x-6">
                {/* SEARCH BOX */}
                {searchOpen ? (
                  <div className="relative">
                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        autoFocus
                        aria-label="Search for products"
                      />
                      <button
                        type="submit"
                        className="ml-2 p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                        aria-label="Submit search"
                      >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="ml-1 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close search"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Open search"
                  >
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </button>
                )}

                {isLoggedIn ? (
                  isAdmin ? (
                    // Admin view
                    <>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                          Hi, Admin {user?.fullName?.split(' ')[0] || 'User'}
                        </span>
                        <button 
                          onClick={handleLogoutClick}
                          className="text-sm font-medium text-gray-700 hover:text-gray-800 cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                      
                      <Link to="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        Admin Dashboard
                      </Link>

                      <Link to="/account">
                        <UserIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </Link>
                    </>
                  ) : (
                    // Regular user view
                    <>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                          Hi, {user?.fullName?.split(' ')[0] || 'User'}
                        </span>
                        <button 
                          onClick={handleLogoutClick}
                          className="text-sm font-medium text-gray-700 hover:text-gray-800 cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                      
                      <Link to="/wishlist" className="relative">
                        <HeartIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </Link>

                      <Link to="/cart" className="relative">
                        <ShoppingBagIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full min-w-[20px] h-5">
                            {itemCount > 99 ? '99+' : itemCount}
                          </span>
                        )}
                      </Link>

                      <Link to="/account">
                        <UserIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </Link>
                    </>
                  )
                ) : (
                  // Logged out state
                  <>
                    <button onClick={openSignin} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Sign in
                    </button>
                    <button onClick={openSignup} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Create account
                    </button>
                    <Link to="/cart" className="relative">
                      <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                    </Link>
                  </>
                )}
              </div>

              {/* MOBILE RIGHT SIDE - Visible on screens below lg (1024px) */}
              {/* Admin Dashboard link removed for mobile - now handled by collapsible sidebar inside AdminDashboard */}
              <div className="flex lg:hidden ml-auto items-center space-x-2">
                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                
                {isLoggedIn && !isAdmin ? (
                  // Mobile logged in regular user
                  <>
                    <Link to="/wishlist" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                      <HeartIcon className="h-5 w-5" />
                    </Link>
                    <Link to="/cart" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                      <ShoppingBagIcon className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full min-w-[18px] h-4">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/account" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                      <UserIcon className="h-5 w-5" />
                    </Link>
                  </>
                ) : isLoggedIn && isAdmin ? (
                  // Mobile admin - only show user icon (no admin dashboard link in navbar)
                  <Link to="/account" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                    <UserIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  // Mobile logged out
                  <>
                    <button onClick={openSignin} className="text-sm font-medium text-gray-700 hover:text-gray-800 px-2">
                      Sign in
                    </button>
                    <Link to="/cart" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                      <ShoppingBagIcon className="h-5 w-5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE SEARCH BAR - Expanded when searchOpen is true on mobile */}
      {searchOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              aria-label="Search for products"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label="Submit search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close search"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE MENU DIALOG - Opens on screens below lg (1024px) */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center px-4 pt-5 pb-2">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                </div>
              ) : (
                <button onClick={openSignin} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                  Sign in
                </button>
              )}

              <Link to="/" className="flex-shrink-0" onClick={() => setMobileOpen(false)}>
                <img
                  className="h-8 w-auto"
                  src={wildBudLogo}
                  alt="Wild Bud Logo"
                />
              </Link>

              {isLoggedIn ? (
                <button onClick={handleLogoutClick} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                  Logout
                </button>
              ) : (
                <button onClick={openSignup} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                  Create account
                </button>
              )}
            </div>

            {/* Mobile Navigation Tabs */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                            <img
                              src={item.imageSrc}
                              alt={item.imageAlt}
                              className="object-cover object-center"
                            />
                          </div>
                          <Link 
                            to={item.href} 
                            className="mt-6 block font-medium text-gray-900"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="absolute inset-0 z-10" />
                            {item.name}
                          </Link>
                          <p aria-hidden="true" className="mt-1">
                            Shop now
                          </p>
                        </div>
                      ))}
                    </div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <p className="font-medium text-gray-900">{section.name}</p>
                        <ul className="mt-6 space-y-6">
                          {section.items.map((item) => (
                            <li key={item.name} className="flex">
                              <Link 
                                to={item.href} 
                                className="text-gray-500"
                                onClick={() => setMobileOpen(false)}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            {/* Mobile Wishlist and Cart Links - Only for regular logged in users */}
            {isLoggedIn && !isAdmin && (
              <div className="px-4 py-3 border-t border-gray-200 mt-2">
                <Link 
                  to="/wishlist" 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <HeartIcon className="h-5 w-5 text-gray-500" />
                  <span>Wishlist</span>
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="relative">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full min-w-[18px] h-4">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span>Shopping Cart {itemCount > 0 && `(${itemCount})`}</span>
                </Link>
              </div>
            )}

            {/* Mobile Pages Links */}
            <div className="px-4 py-3 border-t border-gray-200">
              {navigation.pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {page.name}
                </Link>
              ))}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}