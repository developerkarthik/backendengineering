const pool = require("../config/db");
const DBMSG = require("../config/DBErrorMapping");
const ApiError = require("../errors/ApiError");
const productRepository = require('./product.repository');

const checkProduct = async (product_id, client) => {
    const query = `SELECT price, stock FROM products WHERE id = $1 FOR UPDATE`;

    const result = await client.query(query, [product_id]);

    return result.rows;

}

const updateProduct = async (product_id, stock, client) => {
    const query = `UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING id, stock `;

    const result = await client.query(query, [stock, product_id]);

    return result.rows[0];
}


const createOrder = async (payload, orderItems, client) => {
    const { user_id, status, billing_address, shipping_address } = payload;

    console.log(orderItems);
   // const purchase_at = Date.now(Date.now());

    const orderQuery = `INSERT INTO orders (user_id, billing_address, shipping_address) VALUES($1, $2, $3) RETURNING id, status`;

    const result = await client.query(orderQuery, [user_id, billing_address, shipping_address]);

    for(const item of orderItems){
        const itemQuery = `INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES($1, $2, $3, $4)`;

        await client.query(itemQuery, [result.rows[0].id, item.product_id, item.quantity, item.price]);
    }

    return result.rows[0];
}

const orderTransaction = async (payload) => {
    const { user_id, status, billing_address, shipping_address, purchase_at, orderItems } = payload;

    const order_items = orderItems;

    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        for(let i=0; i<order_items.length; i++){
            const product = await checkProduct(order_items[i].product_id, client);
            if(product.length === 0){
                throw new ApiError('You are passing invalid product id', 400);
            }
            if(order_items[i].quantity > product[0].stock){
                throw new ApiError('One item stock is not available as requested', 400);
            }
            order_items[i] = {
                ...order_items[i],
                price: product[0].price
            }
        }

        for(const item of order_items){
            // Update product stock;
            await updateProduct(item.product_id, item.quantity, client);
        }

        // create order
        await createOrder(payload, order_items,  client);

        // commit
        await client.query('COMMIT');
        return true;
    }catch(error){
        await client.query('ROLLBACK');

        throw error;
    } finally{
        client.release();
    }
}

module.exports = {
    orderTransaction
}