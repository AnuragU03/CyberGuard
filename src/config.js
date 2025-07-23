// src/config.js

const config = {
  claudeApiKey: process.env.REACT_APP_CLAUDE_API_KEY,
  claudeModel: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-sonnet-20240229',
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  api: {
    url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
    timeout: 10000 // 10 seconds default timeout
  },
  environment: process.env.NODE_ENV || 'development',
  useLocalAI: process.env.REACT_APP_USE_LOCAL_AI === 'true' || false
};

export default config;