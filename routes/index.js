var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Import the products router
var productsRouter = require('./products');
// Use the products router for routes starting with /products
router.use('/products', productsRouter);



module.exports = router;


