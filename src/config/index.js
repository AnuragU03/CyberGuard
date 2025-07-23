// src/config/index.js

const config = {
  // API Configuration
  api: {
    url: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 seconds
  },
  
  // IPFS Configuration
  ipfs: {
    host: process.env.REACT_APP_IPFS_HOST || 'ipfs.infura.io',
    port: parseInt(process.env.REACT_APP_IPFS_PORT || '5001', 10),
    protocol: process.env.REACT_APP_IPFS_PROTOCOL || 'https',
    projectId: process.env.REACT_APP_INFURA_PROJECT_ID,
    projectSecret: process.env.REACT_APP_INFURA_SECRET,
  },
  
  // Authentication
  auth: {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    redirectUri: window.location.origin,
  },
  
  // Feature Flags
  features: {
    analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    logging: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
  },
  
  // External Services
  services: {
    googleAnalytics: {
      id: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    },
    sentry: {
      dsn: process.env.REACT_APP_SENTRY_DSN,
    },
  },
  
  // Application Settings
  app: {
    name: 'CyberGuard Platform',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Validate required configuration
const validateConfig = () => {
  const required = [
    { key: 'ipfs.projectId', value: config.ipfs.projectId },
    { key: 'ipfs.projectSecret', value: config.ipfs.projectSecret },
    { key: 'auth.domain', value: config.auth.domain },
    { key: 'auth.clientId', value: config.auth.clientId },
  ];

  const missing = required.filter((item) => !item.value);
  
  if (missing.length > 0) {
    console.warn('Missing required configuration:', missing.map((item) => item.key).join(', '));
    if (process.env.NODE_ENV === 'production') {
      console.error('Missing required configuration in production!');
    }
  }
};

// Validate on import
if (typeof window !== 'undefined') {
  validateConfig();
}

export default config;
