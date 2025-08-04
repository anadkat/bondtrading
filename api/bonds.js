export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get filter parameters from query string
  const { 
    bondType, 
    rating, 
    sector, 
    currency, 
    minYield, 
    maxYield, 
    minMaturity, 
    maxMaturity 
  } = req.query;

  try {
    const apiKey = 'msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0';
    const url = 'https://paper.moment-api.com/v1/data/instrument/?status=outstanding&limit=50';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Moment API error:', response.status, response.statusText);
      res.status(500).json({ error: 'Failed to fetch bonds from Moment API' });
      return;
    }

    const data = await response.json();
    
    // Parse response
    let instruments = [];
    if (data && typeof data === 'object' && data.data) {
      instruments = data.data;
    } else if (Array.isArray(data)) {
      instruments = data;
    } else {
      console.error('Unexpected response format:', data);
      res.status(500).json({ error: 'Unexpected response format from Moment API' });
      return;
    }

    // Convert to frontend format
    let bonds = instruments.map(item => ({
      id: item.isin || item.id || '', // Use ISIN as primary ID since API IDs are empty
      isin: item.isin || '',
      cusip: item.cusip || null,
      issuer: item.issuer || 'Unknown Issuer',
      description: item.description || '',
      bondType: (item.asset_class || 'corporate').toLowerCase(),
      sector: item.sector || null,
      rating: item.rating || null,
      coupon: item.coupon ? String(item.coupon) : null,
      maturityDate: item.maturity_date || null,
      currency: item.currency || 'USD',
      parValue: item.par_value ? String(item.par_value) : null,
      lastPrice: item.last_price ? String(item.last_price) : null,
      ytm: item.yield_to_maturity ? String(item.yield_to_maturity) : null,
      ytw: item.yield_to_worst ? String(item.yield_to_worst) : null,
      status: item.status || 'outstanding',
      updatedAt: new Date().toISOString()
    }));

    // Apply client-side filters
    if (bondType && bondType !== 'all') {
      bonds = bonds.filter(bond => bond.bondType === bondType);
    }

    if (rating && rating !== 'all') {
      bonds = bonds.filter(bond => bond.rating === rating);
    }

    if (sector && sector !== 'all') {
      bonds = bonds.filter(bond => bond.sector === sector);
    }

    if (currency && currency !== 'all') {
      bonds = bonds.filter(bond => bond.currency === currency);
    }

    if (minYield && !isNaN(parseFloat(minYield))) {
      bonds = bonds.filter(bond => {
        const coupon = parseFloat(bond.coupon || '0');
        return coupon >= parseFloat(minYield);
      });
    }

    if (maxYield && !isNaN(parseFloat(maxYield))) {
      bonds = bonds.filter(bond => {
        const coupon = parseFloat(bond.coupon || '0');
        return coupon <= parseFloat(maxYield);
      });
    }

    if (minMaturity && !isNaN(parseInt(minMaturity))) {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() + parseInt(minMaturity));
      bonds = bonds.filter(bond => {
        if (!bond.maturityDate) return false;
        const maturityDate = new Date(bond.maturityDate);
        return maturityDate >= minDate;
      });
    }

    if (maxMaturity && !isNaN(parseInt(maxMaturity))) {
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + parseInt(maxMaturity));
      bonds = bonds.filter(bond => {
        if (!bond.maturityDate) return false;
        const maturityDate = new Date(bond.maturityDate);
        return maturityDate <= maxDate;
      });
    }

    res.status(200).json(bonds);

  } catch (error) {
    console.error('Error fetching bonds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}