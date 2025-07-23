// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Monitor, 
  Database, 
  Bot, 
  AlertTriangle, 
  Cloud,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

const Navigation = ({ mcpConnected }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Activity, label: 'Dashboard' },
    { path: '/url-scanner', icon: Search, label: 'URL Scanner' },
    { path: '/monitor', icon: Monitor, label: 'Background Monitor' },
    { path: '/leak-checker', icon: Database, label: 'Leak Checker' },
    { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    { path: '/incident-reporter', icon: AlertTriangle, label: 'Report Incident' },
    { path: '/storage', icon: Cloud, label: 'Storage' },
  ];

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">CyberGuard</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* MCP Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {mcpConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-xs ${mcpConnected ? 'text-green-400' : 'text-red-400'}`}>
                MCP {mcpConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden pb-4">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
