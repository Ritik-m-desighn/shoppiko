// app/checkout/page.jsx
'use client';

import { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast'; // <-- NEW IMPORT

export default function CheckoutPage() {
  const { cartItems, totalPrice, totalItems, clearCart, loading: cartLoading } = useContext(CartContext);
  const { user, isAuthenticated, token, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(''); // Keep form-level error for complex messages
  const [success, setSuccess] = useState(''); // Keep form-level success for complex messages

  useEffect(() => {
    if (isAuthenticated && user) {
      setShippingAddress(prev => ({ ...prev, fullName: user.name || '' }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !success && !formLoading) {
      setError("Your cart is empty. Please add items to proceed to checkout.");
    }
    if (!authLoading && !isAuthenticated && !success && !formLoading) {
      setError("Please log in to proceed to checkout.");
    }
    if ((cartItems.length > 0 && isAuthenticated) || formLoading) {
      setError('');
    }
  }, [cartItems, cartLoading, isAuthenticated, authLoading, router, success, formLoading]);

  if (cartLoading || authLoading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading checkout...</p>
      </div>
    );
  }

  if ((cartItems.length === 0 && !success && !formLoading) || (!isAuthenticated && !success && !formLoading)) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Checkout Unavailable</h1>
        <p className="text-lg mb-6">{error}</p>
        <Link href={cartItems.length === 0 ? "/" : "/login"} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
          {cartItems.length === 0 ? "Continue Shopping" : "Go to Login"}
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(''); // Clear form error
    setSuccess(''); // Clear form success
    setFormLoading(true);

    const { fullName, address, city, postalCode, country } = shippingAddress;
    if (!fullName || !address || !city || !postalCode || !country) {
      setError('Please fill in all shipping address fields.');
      toast.error('Please fill in all shipping address fields.'); // <-- Toast for this validation
      setFormLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.');
      toast.error('Your cart is empty. Please add items before placing an order.'); // <-- Toast for this validation
      setFormLoading(false);
      return;
    }

    try {
      const orderItemsToSend = cartItems.map(item => ({
        name: item.title,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        price: item.price,
        product: item.productId,
      }));

      const orderData = {
        orderItems: orderItemsToSend,
        shippingAddress: shippingAddress,
        paymentMethod: 'CashOnDelivery',
        itemsPrice: parseFloat(totalPrice),
        shippingPrice: 0.0,
        taxPrice: 0.0,
        totalPrice: parseFloat(totalPrice),
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Your order has been placed successfully! Order ID: ${data._id}`);
        toast.success(`Order placed successfully! ID: ${data._id}`); // <-- Toast for success
        clearCart();
        router.push('/my-orders'); // Optional: Redirect to my orders after successful placement
      } else {
        setError(data.message || 'Failed to place order.');
        toast.error(data.message || 'Failed to place order.'); // <-- Toast for backend error
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.'); // <-- Toast for network error
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-zinc-900 rounded-xl shadow-lg text-white my-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">Checkout</h1>

      {error && (
        <div className="bg-red-200 border border-red-600 text-red-800 px-4 py-3 rounded-lg relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-200 border border-green-600 text-green-800 px-4 py-3 rounded-lg relative mb-4">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Order Summary</h2>
      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex items-center bg-zinc-800 p-3 rounded-lg">
            <img
              src={`http://localhost:5000${item.imageUrl}`}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-md mr-4"
            />
            <div className="flex-grow">
              <p className="font-semibold text-lg">{item.title}</p>
              <p className="text-gray-400 text-sm">{item.quantity} x ₹{item.price.toFixed(2)}</p>
            </div>
            <span className="font-bold text-green-400">₹{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="text-xl font-bold text-right mb-8 border-t border-gray-700 pt-4">
        <span>Total ({totalItems} items): ₹{totalPrice}</span>
      </div>

      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Shipping Information</h2>
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={shippingAddress.fullName}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-700 text-white placeholder-gray-400"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          value={shippingAddress.address}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-700 text-white placeholder-gray-400"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={shippingAddress.city}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-700 text-white placeholder-gray-400"
            required
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={shippingAddress.postalCode}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-700 text-white placeholder-gray-400"
            required
          />
        </div>
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={shippingAddress.country}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-700 text-white placeholder-gray-400"
          required
        />

        <h3 className="text-xl font-semibold mt-6 mb-2">Payment Method</h3>
        <div className="bg-zinc-800 p-4 rounded-lg text-gray-300">
          <p>Payment integration coming soon. For now, we'll simulate order placement.</p>
          <div className="flex items-center mt-2">
            <input type="checkbox" id="cod" name="paymentMethod" className="mr-2" checked readOnly />
            <label htmlFor="cod">Cash on Delivery (Simulated)</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={formLoading || cartItems.length === 0 || !isAuthenticated}
          className={`w-full text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-200 ${
            formLoading || cartItems.length === 0 || !isAuthenticated
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {formLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
