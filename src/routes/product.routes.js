const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProductById } = require('../controllers/product.controller');
const { validateProduct } = require('../validation/product');


const productRouter = express.Router();

productRouter.get('/', getAllProducts);

productRouter.get('/:id', getProductById);

productRouter.post('/', validateProduct, createProduct);

productRouter.patch('/:id', updateProductById);



module.exports = productRouter