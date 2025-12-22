// components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { CartContext } from '@/context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading, isSeller } = useContext(AuthContext);
  const { totalItems, loading: cartLoading } = useContext(CartContext);

  if (loading || cartLoading) return null;

  return (
    <nav className="w-full bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold text-pink-500 tracking-tight hover:text-pink-400 transition-colors duration-200">
          Shoppiko
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium">
          {isAuthenticated ? (
            <>
              <Link href="/cart" className="relative hover:text-pink-500 transition-colors duration-200">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-pink-500 text-white text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isSeller && (
                <>
                  {/* Option 1: A "My Shop" button leading to /my-products */}
                  <Link
                    href="/my-products"
                    className="bg-green-700 text-white px-3 py-1 rounded-full border border-green-600 hover:bg-green-600 transition-colors duration-200"
                  >
                    My Shop
                  </Link>

                  {/* Option 2: A direct "Add Product" link (prominent action) */}
                  <Link
                    href="/add-product" // <-- RESTORED: Direct link to add product page
                    className="bg-blue-600 text-white px-3 py-1 rounded-full border border-blue-500 hover:bg-blue-700 transition-colors duration-200" // New style for this button
                  >
                    Add Product
                  </Link>
                </>
              )}

              <Link href="/my-orders" className="hover:text-pink-500 transition-colors duration-200">My Orders</Link>
              <Link href="/profile" className="hover:text-pink-500 transition-colors duration-200">Profile</Link>

              <button
                onClick={logout}
                className="bg-red-700 text-white px-3 py-1 rounded-full border border-red-600 hover:bg-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-pink-500 transition-colors duration-200">Login</Link>
              <Link
                href="/signup"
                className="bg-pink-500 text-white px-4 py-1.5 rounded-full hover:bg-pink-600 transition-colors duration-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
