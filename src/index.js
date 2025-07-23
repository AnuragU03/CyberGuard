import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import envLoader from './utils/envLoader';

// Initialize environment variables
envLoader.init();

// Only set default mode if not already set
if (localStorage.getItem('useLocalMode') === null) {
  localStorage.setItem('useLocalMode', 'false');
  console.log("Setting default mode to API mode");
}

// Set Claude API key for the session (for testing only)
// REMOVE OR COMMENT OUT IN PRODUCTION
sessionStorage.setItem('CLAUDE_API_KEY', ;
// Ensure local mode is disabled for API testing
localStorage.setItem('useLocalMode', 'false');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);