'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnauthorized(false);

    console.log('Attempting login with:', { email: formData.email });

    try {
      console.log('Making API request to:', 'http://localhost:4000/auth/signin');
      const response = await fetch('http://localhost:4000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Failed to login');
      }

      // Check if user is admin using role property - This check seems out of place in a general login page.
      // It might be better to handle admin redirection based on the user object received.
      // For now, I'll keep it but it might need refactoring depending on the desired flow.
      if (data.user.role !== 'user' && data.user.role !== 'admin') {
         // Assuming 'user' is the standard role for non-admins
        console.log('User role is not recognized:', data.user);
        // Optionally show an error or redirect to a generic dashboard
        // For now, I'll assume successful login for any non-unauthorized role
      }

      console.log('Login successful, user data:', data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role or to a default user dashboard
      if (data.user.role === 'admin') {
          router.push('/admin');
      } else { // Assuming default role is 'user' or any other non-admin role
          router.push('/'); // Redirect to home or a user dashboard
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Village Mart Logo and Text */}
        <div className="flex flex-col items-center">
          {/* Assuming you have an SVG or image for the logo */}
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500 text-white text-xl font-bold">
            V
          </div>
          <div className="mt-3 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Village Mart</h1>
            <p className="text-sm text-gray-600">Your Local Marketplace</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Panel
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Authorized login only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* The unauthorized message from the previous version is kept in case it's needed, 
               but the logic might need adjustment based on the final auth flow. */}
          {isUnauthorized ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unauthorized Access</h3>
              <p className="text-gray-600 mb-4">
                You do not have permission to access this page.
              </p>
              <button
                onClick={() => setIsUnauthorized(false)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign in
                </button>
              </div>

            
            </form>
          )}
          <div className="mt-6 text-center">
            <a href="/signup" className="text-green-600 hover:text-green-700 font-medium">
              Create an admin account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 