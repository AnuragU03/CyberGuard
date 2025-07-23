// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import URLScanner from './pages/URLScanner';
import BackgroundMonitor from './components/BackgroundMonitor';
import LeakChecker from './components/LeakChecker';
import AIAssistant from './components/AIAssistant';
import IncidentReporter from './components/IncidentReporter';
import StorageManager from './components/StorageManager';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
// Remove or comment out Settings import if not found
// import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Services
import mcpService from './services/mcpService';
import './App.css';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// Initialize MCP service
const initializeMCP = async () => {
  try {
    await mcpService.initialize();
    console.log('MCP Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MCP service:', error);
  }
};

// AppRoutes component to handle routing
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize MCP connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeMCP();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<div>Forgot Password</div>} />
        <Route path="/reset-password" element={<div>Reset Password</div>} />
      </Route>

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/url-scanner" element={<URLScanner />} />
        <Route path="/monitor" element={<BackgroundMonitor />} />
        <Route path="/leak-checker" element={<LeakChecker />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/incident-reporter" element={<IncidentReporter />} />
        <Route path="/storage" element={<StorageManager />} />
        <Route path="/profile" element={<Profile />} />
        {/* Remove or comment out Settings route if not found */}
        {/* <Route path="/settings" element={<Settings />} /> */}
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1F2937',
                  color: '#F9FAFB',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#1F2937',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#1F2937',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
