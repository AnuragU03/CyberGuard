const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Claude API proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    // Get the Claude API key from request or environment
    const apiKey = req.headers['x-api-key'] || process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Forward the request to Claude API
    const claudeResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    // Return the Claude API response to the client
    return res.json(claudeResponse.data);
    
  } catch (error) {
    console.error('Claude API proxy error:', error.response?.data || error.message);
    
    // Forward Claude API error response
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ error: 'Error calling Claude API' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});