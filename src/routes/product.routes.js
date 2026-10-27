const express = require('express');
const { getProducts, getProductById, createProduct, updateProductById, deleteProduct, replaceProductById, getProductUserViews } = require('../controllers/product.controller');
const { validateProduct, validateProductPartial } = require('../validation/product');
const { validateFilters, validateSorting, validatePagination } = require('../validation/filters');
const { authenticate } = require('../middleware/auth.middleware');


const productRouter = express.Router();

productRouter.get('/', validatePagination, validateFilters,validateSorting, getProducts);




productRouter.patch('/:id', validateProductPartial,  updateProductById);
productRouter.put('/:id', validateProduct, updateProductById);




// authentication requred
//productRouter.get('/:id', getProductById);
productRouter.get('/:id', authenticate, getProductById);
productRouter.get('/:id/userviews', authenticate, getProductUserViews);
productRouter.post('/', authenticate, validateProduct, createProduct);
productRouter.delete('/:id', authenticate, deleteProduct);

module.exports = productRouter