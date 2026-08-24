const express = require('express');
const { getProducts, getProductById, createProduct, updateProductById, deleteProduct, replaceProductById } = require('../controllers/product.controller');
const { validateProduct, validateProductPartial } = require('../validation/product');
const { validateFilters, validateSorting } = require('../validation/filters');


const productRouter = express.Router();

productRouter.get('/', validateFilters,validateSorting, getProducts);

productRouter.get('/:id', getProductById);

productRouter.post('/', validateProduct, createProduct);

productRouter.patch('/:id', validateProductPartial,  updateProductById);
productRouter.put('/:id', validateProduct, updateProductById);

productRouter.delete('/:id', deleteProduct);

module.exports = productRouter