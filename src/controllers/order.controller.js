const OrderRepository = require("../repositories/order.repository");
const { placeOrder } = require("../services/order.services");

const createOrder = async (req, res, next) => {
    try{

        // I need to check the corner cases, to validate the client data because it is not trustable one.
        const result = await placeOrder(req.body);

        res.status(201).json({
            status: 'ok',
            message: 'Order created '
        });
    }catch(error){
        console.log(error);
        next(error);
    }
}

module.exports = {
    createOrder
}