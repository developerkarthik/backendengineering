const OrderRepository = require("../repositories/order.repository");
const orderServices = require("../services/order.services");

const createOrder = async (req, res, next) => {
    try{

        // I need to check the corner cases, to validate the client data because it is not trustable one.
        const result = await orderServices.placeOrder(req.body);

        res.status(201).json({
            status: 'ok',
            message: 'Order created '
        });
    }catch(error){
        console.log(error);
        next(error);
    }
}

const getOrderById = async (req, res, next) => {
    try{
        const {role, id} = req.user;

        const order_id = req.params.id;

        const result = await orderServices.getOrderById(order_id, id , role);

        res.status(200).json({
            data: result
        });
    }catch(error){
        next(error);
    }
    
}

module.exports = {
    createOrder,
    getOrderById
}