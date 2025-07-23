// src/layouts/AuthLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/">
            <Logo className="h-16 w-auto" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          CyberGuard Platform
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <Link 
            to="/" 
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
