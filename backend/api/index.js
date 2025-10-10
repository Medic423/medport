// Vercel serverless function wrapper for Express app  
const app = require('../dist/index.js').default;

// Wrap Express app in Vercel serverless function handler
module.exports = (req, res) => {
  // Let Express handle the request
  return app(req, res);
};

