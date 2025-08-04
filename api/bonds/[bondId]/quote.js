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

  const { bondId, quantity } = req.query;

  if (!bondId) {
    res.status(400).json({ error: 'Bond ID is required' });
    return;
  }

  try {
    const apiKey = 'msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0';
    
    // First try to get the bond data to get a reference price
    const bondUrl = 'https://paper.moment-api.com/v1/data/instrument/?status=outstanding&limit=100';
    const bondResponse = await fetch(bondUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    let bondData = null;
    if (bondResponse.ok) {
      const allBondsData = await bondResponse.json();
      const instruments = allBondsData?.data || [];
      bondData = instruments.find(item => item.isin === bondId || item.id === bondId);
    }

    // Try the top of order book endpoint
    const url = `https://paper.moment-api.com/v1/data/top-of-order-book/${bondId}`;
    const params = quantity ? `?quantity=${quantity}` : '';
    
    const response = await fetch(`${url}${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // If we get real quote data, return it
    if (response.ok) {
      const data = await response.json();
      // Check if we actually got quote data or just empty response
      if (data && (data.bid_price || data.ask_price)) {
        res.status(200).json(data);
        return;
      }
    }

    console.log('No live quote data available, generating estimated quotes from bond data');
    
    // Generate estimated quotes based on bond data if available
    if (bondData) {
      const basePrice = bondData.last_price || 100; // Use last price or par value
      const coupon = bondData.coupon || 0;
      const ytm = bondData.yield_to_maturity || coupon;
      const ytw = bondData.yield_to_worst || ytm;
      
      // Generate realistic bid/ask spread (typically 0.125 to 0.5 points for bonds)
      const spread = 0.25;
      const bidPrice = basePrice - (spread / 2);
      const askPrice = basePrice + (spread / 2);
      
      const estimatedQuote = {
        instrument_id: bondId,
        timestamp: new Date().toISOString(),
        bid_price: bidPrice,
        bid_yield_to_maturity: ytm * 1.002, // Slightly higher yield for bid
        bid_yield_to_worst: ytw * 1.002,
        bid_size: 1000000, // $1M typical institutional size
        bid_min_size: 25000,
        ask_price: askPrice,
        ask_yield_to_maturity: ytm * 0.998, // Slightly lower yield for ask
        ask_yield_to_worst: ytw * 0.998,
        ask_size: 1000000,
        ask_min_size: 25000,
        status: 'estimated',
        source: 'paper_api_fallback'
      };
      
      res.status(200).json(estimatedQuote);
      return;
    }

    // Fallback to null data if no bond data available
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
      ask_min_size: null,
      status: 'no_data_available',
      source: 'paper_api_limitation'
    });

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