// Main API router for bond trading app
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Route to appropriate handler
  if (path === '/api' || path === '/api/') {
    res.status(200).json({ 
      message: 'Bond Trading API', 
      version: '1.0.0',
      endpoints: [
        '/api/bonds',
        '/api/orders',
        '/api/health'
      ]
    });
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
}