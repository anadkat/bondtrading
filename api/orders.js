export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get orders
    try {
      // Return empty orders array for now
      // In a real app, this would fetch from a database
      res.status(200).json([]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  if (req.method === 'POST') {
    // Submit new order
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.bondId || !orderData.side || !orderData.quantity) {
        res.status(400).json({ error: 'Missing required fields: bondId, side, quantity' });
        return;
      }

      // Generate mock order response (since we're using paper API)
      const mockOrder = {
        order_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_order_id: orderData.client_order_id || `client_${Date.now()}`,
        instrument_id: orderData.bondId,
        side: orderData.side,
        quantity: parseFloat(orderData.quantity),
        order_type: orderData.orderType || 'market',
        price: orderData.limitPrice ? parseFloat(orderData.limitPrice) : null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        filled_quantity: 0,
        average_fill_price: null,
        fees: null
      };

      // Simulate some processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      res.status(200).json(mockOrder);

    } catch (error) {
      console.error('Error submitting order:', error);
      res.status(500).json({ error: 'Failed to submit order' });
    }
    return;
  }

  // Method not allowed for other HTTP methods
  res.status(405).json({ error: 'Method not allowed' });
}