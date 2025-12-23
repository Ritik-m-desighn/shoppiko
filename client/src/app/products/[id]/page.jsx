// app/products/[id]/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation'; // <-- NEW IMPORT: useRouter
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter(); // <-- Initialize useRouter
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Product ID is missing.');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`https://shoppikoooo.onrender.com/api/products/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data);
        } else {
          setError(data.message || 'Failed to fetch product details.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Network error: Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      router.push('/login'); // <-- CRITICAL CHANGE: Redirect to login
      return;
    }

    if (product) {
      addToCart(product);
      toast.success(`${product.title} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 min-h-screen flex items-center justify-center">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found.</p>
      </div>
    );
  }

  const discountedPrice = product.discount > 0
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-zinc-900 rounded-xl shadow-lg text-white my-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center items-center p-4 bg-zinc-800 rounded-lg">
          <img
            src={`https://shoppikoooo.onrender.com${product.imageUrl}`}
            alt={product.title}
            width={500}
            height={500}
            className="rounded-lg object-contain max-h-[500px] w-full border border-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/333/AAA?text=Image+Not+Found';
            }}
          />
        </div>

        <div className="md:w-1/2 flex flex-col p-4">
          <h1 className="text-4xl font-bold mb-3 text-blue-400">{product.title}</h1>
          <p className="text-gray-400 text-lg mb-4">{product.description}</p>

          <div className="flex items-baseline mb-4">
            {product.discount > 0 ? (
              <>
                <span className="text-green-400 text-3xl font-bold">₹{discountedPrice.toFixed(2)}</span>
                <span className="text-gray-500 text-xl line-through ml-3">₹{product.price.toFixed(2)}</span>
                <span className="text-red-400 text-lg ml-3">({product.discount}% OFF)</span>
              </>
            ) : (
              <span className="text-green-400 text-3xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="text-gray-400 text-md space-y-1 mb-6">
            <p><strong>Category:</strong> <span className="capitalize">{product.category}</span></p>
            <p><strong>Stock:</strong> {product.stock > 0 ? <span className="text-green-500">{product.stock} in stock</span> : <span className="text-red-500">Out of Stock</span>}</p>
            <p><strong>Seller:</strong> {product.createdBy?.name || 'N/A'} (<span className="text-sm text-gray-500">{product.createdBy?.email}</span>)</p>
            <p><strong>Published:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>

          {product.stock > 0 ? (
            <button
              className={`mt-auto text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-md
                         transform active:scale-95
                         ${isAuthenticated ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'}`} // Changed disabled styling to interactive styling
              onClick={handleAddToCart}
              // Removed disabled={!isAuthenticated} <-- CRITICAL: Button is now always clickable to trigger redirect
            >
              {isAuthenticated ? 'Add to Cart' : 'Log In to Add'}
            </button>
          ) : (
            <button
              className="mt-auto bg-gray-500 text-white px-6 py-3 rounded-lg text-lg font-semibold cursor-not-allowed opacity-70"
              disabled
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
