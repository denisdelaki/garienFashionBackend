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
  const { data, error } = await supabase
    .from('products')
    .select('*');
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
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
  const updateData = { ...req.body, updated_at: new Date() };
  delete updateData.id; // Prevent updating id
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