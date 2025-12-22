// app/cart/page.jsx
'use client';

import { useContext, useEffect, useState } from 'react';
import { CartContext } from '@/context/CartContext';
import Link from 'next/link'; // Make sure Link is imported

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading } = useContext(CartContext);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading cart...</p>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Your Cart is Empty</h1>
        <p className="text-lg mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleClearCart = () => {
    setShowConfirmation(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowConfirmation(false);
  };

  const cancelClearCart = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-zinc-900 rounded-xl shadow-lg text-white my-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">Your Shopping Cart ({totalItems} items)</h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex flex-col sm:flex-row items-center bg-zinc-800 p-4 rounded-lg shadow-md">
            {/* Product Image */}
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-md border border-gray-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/96x96/333/AAA?text=No+Image';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
              <Link href={`/products/${item.productId}`} className="text-xl font-semibold hover:text-blue-400 transition-colors duration-200">
                {item.title}
              </Link>
              <p className="text-gray-400">Price: ₹{item.price.toFixed(2)}</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 mb-4 sm:mb-0 sm:mr-4">
              <button
                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity <= 1}
              >-</button>
              <span className="text-xl font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={item.quantity >= item.stock}
              >+</button>
            </div>

            {/* Subtotal and Remove Button */}
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-xl font-bold text-green-400 mb-2">₹{(item.price * item.quantity).toFixed(2)}</span>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center text-xl font-bold">
        <span>Total Items: {totalItems}</span>
        <span>Cart Total: ₹{totalPrice}</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleClearCart}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-700 transition duration-300"
        >
          Clear Cart
        </button>
        {/* NEW: Link to Checkout Page */}
        <Link href="/checkout" passHref>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300"
            // The button is inside a Link, so no onClick needed here for navigation.
            // You might want to disable it based on totalItems if cart is empty, though the Link's target will be empty too.
            disabled={totalItems === 0} // Disable if cart is empty
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg p-6 shadow-xl text-white max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Clear Cart</h2>
            <p className="mb-6">Are you sure you want to remove all items from your cart?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmClearCart}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Yes, Clear
              </button>
              <button
                onClick={cancelClearCart}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
