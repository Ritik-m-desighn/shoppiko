// app/signup/page.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast'; // <-- NEW IMPORT for toast notifications
import Link from 'next/link'; // <-- NEW: For link to login

export default function SignupPage() {
  const { isAuthenticated, login, loading: authLoading } = useContext(AuthContext); // Renamed `loading` for clarity
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false); // New state for form submission loading

  // Redirect to home if already logged in (after auth context has loaded)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormLoading(true); // Start form loading
    // setError(''); // No need for local error state, using toast now

    if (!name || !email || !password) {
      toast.error('All fields are required for signup.'); // <-- Use toast
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const userData = { _id: data._id, name: data.name, email: data.email, role: data.role }; // Ensure role is captured
        login(data.token, userData); // ✅ Sets auth context and redirects
        toast.success('Signup successful! Welcome!'); // <-- Use toast for success
      } else {
        toast.error(data.message || 'Signup failed. Please try again.'); // <-- Use toast for error
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Network error. Please check your connection.'); // <-- Use toast for network error
    } finally {
      setFormLoading(false); // End form loading
    }
  };

  if (authLoading || isAuthenticated) { // Show loading if auth context is still loading or user is already authenticated
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-xl shadow-lg border border-gray-700 text-white"> {/* Updated container */}
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Sign Up</h1> {/* Updated heading */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* We're using toasts for errors/success, so this local error display can be removed or modified */}
          {/* {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )} */}
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500" /* Updated input styling */
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500" /* Updated input styling */
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500" /* Updated input styling */
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={formLoading} // Disable button during submission
            className={`w-full px-4 py-2 rounded-lg text-lg font-semibold
                       transition ease-in-out duration-200 transform active:scale-95
                       ${formLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}` // Updated button styling
                     }
          >
            {formLoading ? 'Signing Up...' : 'Signup'}
          </button>
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
