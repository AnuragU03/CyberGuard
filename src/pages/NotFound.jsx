// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 text-red-500">
            <AlertTriangle className="h-10 w-10" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mt-6 text-4xl font-extrabold text-white">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-lg text-gray-300">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go back home
          </Link>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:support@cyberguard.com"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
