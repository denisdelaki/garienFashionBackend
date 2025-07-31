var express = require('express');
var router = express.Router();
var supabase = require('../supabase'); 

// CREATE a product
router.post('/', async (req, res) => {
  const now = new Date();
  const productData = { ...req.body, createdAt: now, updatedAt: now };
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data[0]);
});

// READ all products
router.get('/', async (req, res) => {
  try {
    console.log('Fetching products...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const supabasePromise = supabase
      .from('products')
      .select('*');
    
    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    console.log('Products fetched successfully:', data?.length || 0);
    res.json(data);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// READ a product by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(data);
});

// UPDATE a product
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const updateData = { ...req.body, updatedAt: new Date() };
  delete updateData.id; 
  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select();
  if (error || data.length === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(data[0]);
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;