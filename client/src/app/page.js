// app/page.js
'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- NEW IMPORT
import { CartContext } from '@/context/CartContext';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { addToCart } = useContext(CartContext);
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const router = useRouter(); // <-- Initialize useRouter

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        if (res.ok) {
          setProducts(data);
        } else {
          setError(data.message || 'Failed to fetch products.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Network error: Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCartFromList = (e, product) => {
    e.stopPropagation();
    e.preventDefault();

    if (authLoading) return;

    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      router.push('/login'); // <-- CRITICAL CHANGE: Redirect to login
      return;
    }

    if (product.stock > 0) {
      addToCart(product);
      toast.success(`${product.title} added to cart!`);
    } else {
      toast.error(`${product.title} is out of stock!`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Available Products</h1>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="border rounded-xl shadow-md p-4 bg-zinc-800 animate-pulse">
              <div className="w-full h-48 bg-gray-700 rounded-md mb-3" />
              <div className="h-5 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
              <div className="mt-2 h-4 bg-gray-600 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-200 border border-red-600 text-red-800 px-4 py-3 rounded-lg relative text-center">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center text-gray-400 text-lg mt-8">
          No products available. Be the first to <Link href="/add-product" className="text-blue-400 hover:underline">add one!</Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product._id} href={`/products/${product._id}`} passHref>
              <div
                className="border border-gray-700 rounded-xl shadow-lg p-4 bg-zinc-900 text-white flex flex-col items-center justify-between h-full
                           transform transition-all duration-300 ease-in-out
                           hover:scale-[1.03] hover:bg-zinc-800 hover:shadow-2xl
                           cursor-pointer"
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
                <p className="text-gray-500 text-xs text-center">Seller: {product.createdBy?.name || 'Unknown'}</p>

                {product.stock > 0 ? (
                  <button
                    className={`mt-4 text-white px-4 py-2 rounded-lg w-full transition duration-200
                               transform active:scale-95
                               ${isAuthenticated ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'}`} // Changed disabled styling to interactive styling
                    onClick={(e) => handleAddToCartFromList(e, product)}
                    // Removed disabled={!isAuthenticated} <-- CRITICAL: Button is now always clickable to trigger redirect
                  >
                    {isAuthenticated ? 'Add to Cart' : 'Log In to Add'}
                  </button>
                ) : (
                  <button
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg w-full cursor-not-allowed opacity-70"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
