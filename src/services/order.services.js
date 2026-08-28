const OrderRepository = require('../repositories/order.repository');

const placeOrder = async (payload) => {
    return await OrderRepository.orderTransaction(payload);
}

module.exports = {
    placeOrder
}