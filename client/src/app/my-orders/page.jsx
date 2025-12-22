// app/my-orders/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast'; // For notifications

export default function MyOrdersPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false); // New state for confirmation
  const [orderToCancel, setOrderToCancel] = useState(null); // New state to store order being cancelled

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data);
      } else {
        setError(data.message || 'Failed to fetch your orders.');
        toast.error(data.message || 'Failed to fetch your orders.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Network error: Could not connect to the server.');
      toast.error('Network error: Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchMyOrders();
    } else if (!authLoading && !isAuthenticated) {
      setError('Please log in to view your orders.');
    }
  }, [authLoading, isAuthenticated, token]);


  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelConfirmation(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel || !token) return;

    setShowCancelConfirmation(false); // Close confirmation modal immediately

    try {
      setLoading(true); // Show loading indicator during cancellation
      const res = await fetch(`http://localhost:5000/api/orders/${orderToCancel}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Order ${orderToCancel} cancelled successfully! Stock restored.`);
        // Re-fetch orders to update the list immediately
        fetchMyOrders();
      } else {
        setError(data.message || 'Failed to cancel order.');
        toast.error(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Cancellation network error:', err);
      setError('Network error during cancellation. Please try again.');
      toast.error('Network error during cancellation.');
    } finally {
      setLoading(false); // Hide loading indicator
      setOrderToCancel(null); // Clear order to cancel state
    }
  };

  const cancelCancel = () => {
    setShowCancelConfirmation(false);
    setOrderToCancel(null);
  };


  if (authLoading || loading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Error: {error}</p>
        {!isAuthenticated && (
          <Link href="/login" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
            Go to Login
          </Link>
        )}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-white">No Orders Found</h1>
        <p className="text-lg mb-6">You haven't placed any orders yet.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-zinc-900 rounded-xl shadow-lg text-white my-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-zinc-800 p-6 rounded-lg shadow-md border border-gray-700">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b border-gray-600">
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Order ID: <span className="text-gray-300 text-lg">{order._id}</span></h2>
              <p className="text-gray-400 text-sm">Placed On: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Order Status */}
            <div className="mb-4 flex flex-wrap gap-2 items-center"> {/* Added flex-wrap for responsiveness */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.isDelivered ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                {order.isDelivered ? 'Delivered' : 'Pending Delivery'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.isPaid ? 'bg-blue-600' : 'bg-red-600'} text-white`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
              {order.isCancelled && ( // Display cancelled status
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-800 text-white">
                  Cancelled
                </span>
              )}
            </div>

            {/* Shipping Address */}
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Shipping Address:</h3>
            <p className="text-gray-400 text-sm mb-4">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.address}, {order.shippingAddress.city}<br />
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>

            {/* Order Items */}
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Items:</h3>
            <div className="space-y-3 mb-4">
              {order.orderItems.map((item) => (
                <div key={item.product._id} className="flex items-center bg-zinc-700 p-3 rounded-lg">
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md mr-4 border border-gray-600"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/48x48/333/AAA?text=Img';
                    }}
                  />
                  <div className="flex-grow">
                    <Link href={`/products/${item.product._id}`} className="font-medium text-blue-300 hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-gray-400 text-sm">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-green-400">₹{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="flex justify-end border-t border-gray-600 pt-3 mt-4">
              <span className="text-xl font-bold">Total: ₹{order.totalPrice.toFixed(2)}</span>
            </div>

            {/* Cancel Order Button */}
            {/* Only show if not delivered and not already cancelled */}
            {!order.isDelivered && !order.isCancelled && (
              <div className="mt-4 text-right">
                <button
                  onClick={() => handleCancelClick(order._id)}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700
                             transition ease-in-out duration-200 transform active:scale-95"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg p-6 shadow-xl text-white max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Cancellation</h2>
            <p className="mb-6">Are you sure you want to cancel Order ID: <span className="font-bold">{orderToCancel}</span>?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmCancelOrder}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200 transform active:scale-95"
              >
                Yes, Cancel
              </button>
              <button
                onClick={cancelCancel}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200 transform active:scale-95"
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
