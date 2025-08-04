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
    const url = `https://paper.moment-api.com/v1/data/instrument/${bondId}/`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        res.status(404).json({ error: 'Bond not found' });
        return;
      }
      console.error('Moment API error:', response.status, response.statusText);
      res.status(500).json({ error: 'Failed to fetch bond details' });
      return;
    }

    const data = await response.json();
    
    // Convert to frontend format
    const bond = {
      id: data.id || '',
      isin: data.isin || '',
      cusip: data.cusip || null,
      issuer: data.issuer || 'Unknown Issuer',
      description: data.description || '',
      bondType: (data.asset_class || 'corporate').toLowerCase(),
      sector: data.sector || null,
      rating: data.rating || null,
      coupon: data.coupon ? String(data.coupon) : null,
      maturityDate: data.maturity_date || null,
      currency: data.currency || 'USD',
      parValue: data.par_value ? String(data.par_value) : null,
      lastPrice: data.last_price ? String(data.last_price) : null,
      ytm: data.yield_to_maturity ? String(data.yield_to_maturity) : null,
      ytw: data.yield_to_worst ? String(data.yield_to_worst) : null,
      status: data.status || 'outstanding',
      updatedAt: new Date().toISOString()
    };

    res.status(200).json(bond);

  } catch (error) {
    console.error('Error fetching bond details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}