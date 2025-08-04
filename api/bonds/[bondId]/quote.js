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
    const url = `https://paper.moment-api.com/v1/trading/quote/${bondId}/`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Moment API error:', response.status, response.statusText);
      // Return null quote data for paper API
      res.status(200).json({
        timestamp: new Date().toISOString(),
        bid_price: null,
        bid_yield_to_maturity: null,
        bid_yield_to_worst: null,
        bid_size: null,
        bid_min_size: null,
        ask_price: null,
        ask_yield_to_maturity: null,
        ask_yield_to_worst: null,
        ask_size: null,
        ask_min_size: null
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return null quote data on error
    res.status(200).json({
      timestamp: new Date().toISOString(),
      bid_price: null,
      bid_yield_to_maturity: null,
      bid_yield_to_worst: null,
      bid_size: null,
      bid_min_size: null,
      ask_price: null,
      ask_yield_to_maturity: null,
      ask_yield_to_worst: null,
      ask_size: null,
      ask_min_size: null
    });
  }
}