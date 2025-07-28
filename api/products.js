const supabase = require('../supabase');

module.exports = async (req, res) => {
  const method = req.method;
  const id = req.query.id;

  try {
    if (method === 'GET') {
      if (id) {
        // Get product by ID
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) return res.status(404).json({ message: 'Product not found' });
        return res.json(data);
      } else {
        // Get all products
        const { data, error } = await supabase
          .from('products')
          .select('*');
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }
    }

    if (method === 'POST') {
      const now = new Date();
      const productData = { ...req.body, createdAt: now, updatedAt: now };
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data[0]);
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'Missing product ID in query' });
      const updateData = { ...req.body, updated_at: new Date() };
      delete updateData.id;
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();
      if (error || data.length === 0) return res.status(404).json({ message: 'Product not found' });
      return res.json(data[0]);
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'Missing product ID in query' });
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ message: 'Product deleted successfully' });
    }

    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
