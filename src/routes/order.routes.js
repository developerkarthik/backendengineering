const express = require('express');
const { createOrder } = require('../controllers/order.controller');
const { validateOrders } = require('../validation/orders');

const orderRouter = express.Router();

orderRouter.post('/', validateOrders, createOrder);

module.exports = orderRouter;



