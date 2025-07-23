// Environment Variables Loader
const envLoader = {
  // Load and validate environment variables
  init() {
    // Check for required variables
    this.validateEnv();
    
    // Make them available globally if needed
    window.ENV = {
      CLAUDE_API_KEY: process.env.REACT_APP_CLAUDE_API_KEY,
      CLAUDE_MODEL: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-sonnet-20240229'
    };
    
    return this;
  },
  
  // Validate environment variables
  validateEnv() {
    // Log environment status
    if (process.env.NODE_ENV === 'development') {
      console.log('Environment: Development');
      
      // Check for Claude API key
      if (process.env.REACT_APP_CLAUDE_API_KEY) {
        console.log('Claude API Key: Available');
      } else {
        console.warn('Claude API Key: Not found - will use local mode');
      }
      
      // Check for Claude model
      console.log('Claude Model:', process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-sonnet-20240229 (default)');
    }
  },
  
  // Get environment variable with fallback
  get(key, fallback = null) {
    return process.env[`REACT_APP_${key}`] || fallback;
  }
};

export default envLoader;