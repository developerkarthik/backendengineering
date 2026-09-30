const express = require('express');
const { createOrder, getOrderById } = require('../controllers/order.controller');
const { validateOrders } = require('../validation/orders');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const orderRouter = express.Router();

orderRouter.post('/', validateOrders, createOrder);
orderRouter.get('/:id', authenticate, getOrderById)

module.exports = orderRouter;



