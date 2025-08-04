export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { bondId } = req.query;

  if (!bondId) {
    res.status(400).json({ error: 'Bond ID is required' });
    return;
  }

  try {
    const apiKey = 'msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0';
    const url = `https://paper.moment-api.com/v1/trading/order-book/${bondId}/`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Moment API error:', response.status, response.statusText);
      // Return empty order book for paper API
      res.status(200).json({
        bids: [],
        asks: [],
        timestamp: new Date().toISOString()
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching order book:', error);
    // Return empty order book on error
    res.status(200).json({
      bids: [],
      asks: [],
      timestamp: new Date().toISOString()
    });
  }
}