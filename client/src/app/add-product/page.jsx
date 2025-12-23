// app/add-product/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const { token, isAuthenticated, isSeller, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        toast.error('Please log in to add products.');
      } else if (!isSeller) {
        router.push('/');
        toast.error('You must be a seller to add products.');
      }
    }
  }, [isAuthenticated, isSeller, authLoading, router]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!title || !description || !price || !category || !stock || !imageFile) {
      toast.error('All fields and an image are required to publish a product.');
      setFormLoading(false);
      return;
    }

    if (isNaN(price) || parseFloat(price) < 0) {
      toast.error('Price must be a non-negative number.');
      setFormLoading(false);
      return;
    }

    if (isNaN(stock) || parseInt(stock) < 0) {
      toast.error('Stock must be a non-negative integer.');
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
    formData.append('productImage', imageFile);

    try {
      const res = await fetch('https://shoppikoooo.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Product published successfully!');
        // --- CRITICAL CHANGE: Redirect after successful product creation ---
        router.push(`/products/${data._id}`); // Redirect to the newly created product's detail page
        // OR: router.push('/my-products'); // Redirect to My Products page
        // Choose the one you prefer. Redirecting to the specific product page is often good.
      } else {
        toast.error(data.message || 'Failed to publish product.');
      }
    } catch (err) {
      console.error('Error publishing product:', err);
      toast.error('Network error. Failed to publish product.');
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading) || (!isSeller && isAuthenticated && !authLoading)) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg p-8 bg-zinc-900 rounded-xl shadow-lg border border-gray-700 text-white my-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Publish New Product</h1>
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
              <label htmlFor="price" className="block text-gray-300 text-sm font-bold mb-2">Price (₹)</label>
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
            <input
              type="file"
              id="productImage"
              name="productImage"
              accept="image/*"
              className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer
                         transition duration-200"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className={`w-full px-6 py-3 rounded-lg text-lg font-semibold
                       transition ease-in-out duration-200 transform active:scale-95
                       ${formLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'}`
                     }
          >
            {formLoading ? 'Publishing Product...' : 'Publish Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
