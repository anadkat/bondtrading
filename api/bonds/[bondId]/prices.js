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

  const { bondId, start, end, frequency = '1day' } = req.query;

  if (!bondId) {
    res.status(400).json({ error: 'Bond ID is required' });
    return;
  }

  if (!start || !end) {
    res.status(400).json({ error: 'Start and end dates are required' });
    return;
  }

  try {
    const apiKey = 'msk_papr.5dde1e4b.qcUk-rVwMth7b7woezLIk_lAtLwL_Kg0';
    const url = `https://paper.moment-api.com/v1/data/instrument/${bondId}/price/?start=${start}&end=${end}&frequency=${frequency}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Moment API error:', response.status, response.statusText);
      res.status(200).json({
        data: [],
        count: 0,
        frequency: frequency,
        start_date: start,
        end_date: end
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching historical prices:', error);
    res.status(200).json({
      data: [],
      count: 0,
      frequency: frequency,
      start_date: start,
      end_date: end
    });
  }
}