// app/my-products/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // For redirection

export default function MyProductsPage() {
  const { user, token, isAuthenticated, isSeller, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Redirect if not authenticated or not a seller after loading auth state
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        toast.error('Please log in to view your products.');
      } else if (!isSeller) {
        router.push('/'); // Redirect non-sellers to home
        toast.error('You must be a seller to view this page.');
      }
    }
  }, [isAuthenticated, isSeller, authLoading, router]);


  const fetchMyProducts = async () => {
    if (!token) return; // Don't fetch if token is missing

    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/api/products?myProducts=true', { // Fetch only current user's products
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProducts(data);
      } else {
        setError(data.message || 'Failed to fetch your products.');
        toast.error(data.message || 'Failed to fetch your products.');
      }
    } catch (err) {
      console.error('Error fetching my products:', err);
      setError('Network error: Could not connect to the server.');
      toast.error('Network error: Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && isSeller && token) {
      fetchMyProducts();
    }
  }, [isAuthenticated, isSeller, authLoading, token]); // Refetch if auth/seller status or token changes

  // Handle Delete Confirmation
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !token) return;

    setShowDeleteConfirmation(false); // Close modal
    setLoading(true); // Show loading indicator during deletion

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Product deleted successfully!');
        fetchMyProducts(); // Re-fetch list to show updated products
      } else {
        setError(data.message || 'Failed to delete product.');
        toast.error(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Network error during deletion. Please try again.');
      toast.error('Network error during deletion.');
    } finally {
      setLoading(false);
      setProductToDelete(null); // Clear product to delete state
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setProductToDelete(null);
  };


  if (authLoading || loading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading your products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Error: {error}</p>
        {!isAuthenticated && (
          <Link href="/login" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform active:scale-95">
            Go to Login
          </Link>
        )}
      </div>
    );
  }

  // If authenticated but not a seller (redirected by useEffect)
  // This block won't typically be reached because of the useEffect redirect, but good for robust handling
  if (!isSeller) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Access Denied</h1>
        <p className="text-lg mb-6">You must be a seller to manage products.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform active:scale-95">
          Go to Home
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-white">No Products Yet</h1>
        <p className="text-lg mb-6">You haven't uploaded any products.</p>
        <Link href="/add-product" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform active:scale-95">
          Add Your First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white text-center">My Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border border-gray-700 rounded-xl shadow-lg p-4 bg-zinc-900 text-white flex flex-col items-center justify-between h-full
                       transform transition-all duration-300 ease-in-out
                       hover:scale-[1.03] hover:bg-zinc-800 hover:shadow-2xl"
          >
            <img
              src={`http://localhost:5000${product.imageUrl}`}
              alt={product.title}
              className="w-full h-48 object-cover rounded-md mb-4 border border-gray-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/333/AAA?text=Image+Not+Found';
              }}
            />
            <h2 className="text-xl font-semibold mb-2 text-center break-words">{product.title}</h2>
            <p className="text-gray-400 text-sm mb-2 text-center line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-baseline w-full mt-auto">
              <span className="text-green-400 text-lg font-bold">₹{product.price.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-sm text-red-400 ml-2">(-{product.discount}%)</span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1 text-center">Category: {product.category}</p>
            <p className="text-gray-500 text-xs text-center">Stock: {product.stock}</p>
            {/* We don't show seller info here, as it's "my" products */}

            <div className="flex space-x-2 mt-4 w-full">
              {/* Edit Button - Will link to edit page */}
              <Link href={`/edit-product/${product._id}`} className="flex-1">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full
                             transition ease-in-out duration-200 transform active:scale-95"
                >
                  Edit
                </button>
              </Link>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteClick(product._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full
                           transition ease-in-out duration-200 transform active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg p-6 shadow-xl text-white max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDeleteProduct}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition duration-200 transform active:scale-95"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition duration-200 transform active:scale-95"
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
