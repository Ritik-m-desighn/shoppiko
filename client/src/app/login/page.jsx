    // app/login/page.jsx
    'use client';

    import { useState, useEffect, useContext } from 'react';
    import { useRouter } from 'next/navigation';
    import { AuthContext } from '@/context/AuthContext';
    import toast from 'react-hot-toast';
    import Link from 'next/link';

    export default function LoginPage() {
      const { isAuthenticated, login, loading: authLoading } = useContext(AuthContext);
      const router = useRouter();

      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [formLoading, setFormLoading] = useState(false);

      useEffect(() => {
        if (!authLoading && isAuthenticated) {
          router.push('/');
        }
      }, [isAuthenticated, authLoading, router]);

      const handleLogin = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        if (!email || !password) {
          toast.error('Please enter both email and password.');
          setFormLoading(false);
          return;
        }

        try {
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok) {
            const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
            // console.log("[LoginPage] Raw data from backend:", data); // Debug
            // console.log("[LoginPage] UserData being passed to AuthContext.login:", userData); // Debug
            login(data.token, userData);
            toast.success('Login successful! Welcome back!');
          } else {
            toast.error(data.message || 'Login failed. Please check your credentials.');
          }
        } catch (err) {
          console.error('Login error:', err); // Keep console.error
          toast.error('Network error. Please check your connection.');
        } finally {
          setFormLoading(false);
        }
      };

      if (authLoading || isAuthenticated) {
        return (
          <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-lg">Loading...</p>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-sm p-8 bg-zinc-900 rounded-xl shadow-lg border border-gray-700 text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Log In</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-700 rounded-lg bg-zinc-800 text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={formLoading}
                className={`w-full px-4 py-2 rounded-lg text-lg font-semibold
                           transition ease-in-out duration-200 transform active:scale-95
                           ${formLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}`
                         }
              >
                {formLoading ? 'Logging In...' : 'Login'}
              </button>
              <p className="text-center text-gray-400 text-sm mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:underline">
                  Signup
                </Link>
              </p>
            </form>
          </div>
        </div>
      );
    }
    