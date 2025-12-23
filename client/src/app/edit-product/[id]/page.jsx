// app/edit-product/[id]/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditProductPage() { // <-- CRITICAL: ENSURE THIS LINE IS EXACTLY AS SHOWN
  const { user, token, isAuthenticated, isSeller, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        toast.error('Please log in to edit products.');
      } else if (!isSeller) {
        router.push('/');
        toast.error('You must be a seller to edit products.');
      }
    }
  }, [isAuthenticated, isSeller, authLoading, router]);

  // Fetch product data to pre-fill the form
  useEffect(() => {
    if (isAuthenticated && isSeller && id && token) {
      const fetchProductData = async () => {
        try {
          setPageLoading(true);
          setFetchError('');
          const res = await fetch(`https://shoppikoooo.onrender.com/api/products/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await res.json();

          if (res.ok) {
            // AUTHORIZATION CHECK: Ensure logged-in user is the product owner or admin
            if (data.createdBy._id !== user._id && user.role !== 'admin') {
                toast.error("You are not authorized to edit this product.");
                router.push('/my-products');
                return;
            }

            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price);
            setCategory(data.category);
            setStock(data.stock);
            setDiscount(data.discount);
            setCurrentImageUrl(`https://shoppikoooo.onrender.com${data.imageUrl}`);
          } else {
            setFetchError(data.message || 'Failed to load product for editing.');
            toast.error(data.message || 'Failed to load product for editing.');
          }
        } catch (err) {
          console.error('Error fetching product for edit:', err);
          setFetchError('Network error: Could not load product.');
          toast.error('Network error: Could not load product.');
        } finally {
          setPageLoading(false);
        }
      };
      fetchProductData();
    } else if (!authLoading && (!isAuthenticated || !isSeller)) {
        setPageLoading(false);
    }
  }, [id, isAuthenticated, isSeller, token, authLoading, router, user]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFetchError('');

    if (!isAuthenticated || !isSeller) {
        toast.error('Not authorized to update product.');
        setFormLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stock', stock);
    formData.append('discount', discount);
    if (imageFile) {
      formData.append('productImage', imageFile);
    }

    try {
      const res = await fetch(`https://shoppikoooo.onrender.com/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Product updated successfully!');
        router.push('/my-products');
      } else {
        toast.error(data.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Network error. Failed to update product.');
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading product for edit...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 text-center text-red-400 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Error: {fetchError}</p>
        <Link href="/my-products" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform active:scale-95">
          Back to My Products
        </Link>
      </div>
    );
  }

  if (!isAuthenticated || !isSeller) {
    return null; // This case should be handled by useEffect redirect, but good for robustness
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg p-8 bg-zinc-900 rounded-xl shadow-lg border border-gray-700 text-white my-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Product Title"
              className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              placeholder="Product Description"
              className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-gray-300 text-sm font-bold mb-2">Price ($)</label>
              <input
                type="number"
                id="price"
                placeholder="0.00"
                step="0.01"
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">Category</label>
              <input
                type="text"
                id="category"
                placeholder="Electronics, Apparel, Books..."
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="block text-gray-300 text-sm font-bold mb-2">Stock</label>
              <input
                type="number"
                id="stock"
                placeholder="0"
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="discount" className="block text-gray-300 text-sm font-bold mb-2">Discount (%)</label>
              <input
                type="number"
                id="discount"
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="productImage" className="block text-gray-300 text-sm font-bold mb-2">Product Image</label>
            {currentImageUrl && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Image:</p>
                <img
                  src={currentImageUrl}
                  alt="Current Product"
                  className="w-48 h-48 object-cover rounded-md border border-gray-600 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/192x192/333/AAA?text=No+Current+Image';
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="productImage"
              accept="image/*"
              className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer
                         transition duration-200"
              onChange={handleFileChange}
            />
            <p className="text-gray-500 text-xs mt-1">Leave blank to keep current image. Select a new image to replace it.</p>
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className={`w-full px-6 py-3 rounded-lg text-lg font-semibold
                       transition ease-in-out duration-200 transform active:scale-95
                       ${formLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'}`
                     }
          >
            {formLoading ? 'Updating Product...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
