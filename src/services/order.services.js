const ApiError = require('../errors/ApiError');
const OrderRepository = require('../repositories/order.repository');

const placeOrder = async (payload) => {
    return await OrderRepository.orderTransaction(payload);
}

const getOrderById = async (order_id, user_id, role) => {
    const orders = await OrderRepository.getOrderById(order_id);
    if(orders.length === 0){
        throw new ApiError('No order data exists!', 404);
    }
    
    if(user_id !== Number(orders[0].user_id) && role !== 'ADMIN'){
        throw new ApiError("You don't have a permissions", 403);
    }

    return orders;
}

module.exports = {
    placeOrder,
    getOrderById
}