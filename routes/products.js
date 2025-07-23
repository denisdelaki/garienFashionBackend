var express = require('express');
var router = express.Router();

let products = [];
let currentId = 1;

// CREATE a product
router.post('/', (req, res) => {
  const product = {
    id: currentId++,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  products.push(product);
  res.status(201).json(product);
});

// READ all products
router.get('/', (req, res) => {
  res.json(products);
});

// READ a product by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// UPDATE a product
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products[index] = {
    ...products[index],
    ...req.body,
    updatedAt: new Date()
  };
  res.json(products[index]);
});

// DELETE a product
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;