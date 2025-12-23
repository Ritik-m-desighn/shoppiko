// app/profile/page.jsx
'use client';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // For potential future notifications

export default function ProfilePage() {
  const { user, token, isAuthenticated, loading: authLoading } = useContext(AuthContext); // Renamed `loading` to `authLoading` for clarity
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [pageLoading, setPageLoading] = useState(true); // New state to manage overall page loading

  useEffect(() => {
    // Initial check for authentication state
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        toast.error('Please log in to view your profile.'); // Add a toast for redirection
        setPageLoading(false); // Stop page loading if not authenticated
        return;
      }
      // If authenticated, proceed to fetch profile data
      fetchProfile();
    }
  }, [isAuthenticated, authLoading, token, router]); // Dependency array: run when auth state or token changes

  const fetchProfile = async () => {
    if (!token) { // Ensure token exists before fetching
      setFetchError('Authentication token missing.');
      setPageLoading(false);
      return;
    }
    try {
      setPageLoading(true); // Start loading profile data
      setFetchError(''); // Clear previous errors

      const res = await fetch('https://shoppikoooo.onrender.com/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`, // Send the token!
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProfileData(data);
      } else {
        setFetchError(data.message || 'Failed to fetch profile.');
        toast.error(data.message || 'Failed to fetch profile.');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setFetchError('Network error or server unreachable.');
      toast.error('Network error or server unreachable.');
    } finally {
      setPageLoading(false); // End loading regardless of success or failure
    }
  };

  // Combined loading state for the page
  if (authLoading || pageLoading) {
    return (
      <div className="p-6 text-center text-gray-300 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 text-center text-red-400 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Error: {fetchError}</p>
        {!isAuthenticated && ( // Offer login if the error is due to unauthenticated state
          <Link href="/login" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform active:scale-95">
            Go to Login
          </Link>
        )}
      </div>
    );
  }

  // If profileData is null after loading, means an error occurred and was handled, or no data found
  if (!profileData) {
    return (
      <div className="p-6 text-center text-gray-400 min-h-screen flex items-center justify-center">
        <p className="text-xl">No profile data available.</p> {/* Displayed if fetchProfile didn't set data for some reason */}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-zinc-900 shadow-lg rounded-xl text-white my-8 border border-gray-700"> {/* Updated styling */}
      <h1 className="text-3xl font-bold mb-6 text-blue-400 text-center">My Profile</h1> {/* Updated heading color */}
      <div className="space-y-4">
        <div className="bg-zinc-800 p-4 rounded-lg border border-gray-700"> {/* Inner div for better separation */}
          <p className="text-gray-300">
            <strong className="block text-gray-400 text-sm mb-1">Name:</strong> {profileData.name}
          </p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300">
            <strong className="block text-gray-400 text-sm mb-1">Email:</strong> {profileData.email}
          </p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300">
            <strong className="block text-gray-400 text-sm mb-1">Role:</strong> {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
          </p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300">
            <strong className="block text-gray-400 text-sm mb-1">Member Since:</strong> {new Date(profileData.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Example "Edit Profile" button with animation */}
        <div className="mt-6 text-center">
            {/* Keeping this commented out as actual update functionality isn't built yet,
                but shows how to apply the common button styles. */}
            {/* <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700
                       transition ease-in-out duration-200 transform active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
            >
              Edit Profile
            </button> */}
        </div>
      </div>
    </div>
  );
}
