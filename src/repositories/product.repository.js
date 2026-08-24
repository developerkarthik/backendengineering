const pool = require('../config/db');
const ApiError = require('../errors/ApiError');
const { createClause } = require('../utils/filters');

const getTotalCount = async (filters) => {

    const {whereClause, values} = createClause(filters);

    const result = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, [...values]);
    
    return result.rows[0].count;
}
const fetchProducts = async (filters, limit, offset, sortBy, sortOrder) => {
    const {whereClause, values} = createClause(filters);
    const NFilters = Object.keys(filters).length; 
    const result = await pool.query(`SELECT * FROM PRODUCTS ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${NFilters+1} OFFSET $${NFilters+2}`, [...values, limit, offset]);

    return result.rows;
} 

const fetchProductById = async (productId) => {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    return result.rows[0] || null;
}

const createNew = async (product) => {
    const fields = Object.keys(product);
    const valueMap = fields.map((key, index) => {
        return `$${index+1}`
    });

    const values = Object.values(product);

    const query = `INSERT INTO products(${[...fields]}) VALUES(${[...valueMap]}) RETURNING *`;

    const result = await pool.query(query, values);

    return result.rows[0];
}

const findByNameAndCategory = async (product) => {
    const query = "SELECT * FROM products WHERE name=$1 AND category=$2";
    const result = await pool.query(query, [product.name, product.category]);
    
    return result.rowCount;
}

const updateProductById = async (productId, payload) => {

    const allowedFields = ['name', 'category', 'price', 'stock'];

    const keys = Object.keys(payload).filter(key => allowedFields.includes(key));;

    const setClause = keys.map((key, index) => `${key} = $${index+1}`).join(',');

    const query = `UPDATE products SET ${setClause} WHERE id=$${keys.length + 1} RETURNING ${keys.join(',')}`;

    const values = keys.map(key => payload[key]);

    const result = await pool.query(query, [...values, productId]);

    if (result.rowCount === 0) {
        throw new ApiError("Product doesn't exist.", 404);
    }

    return result.rows[0];
}

const deleteProduct = async (productId) => {
    // authenication
    // Foreign key impleication
    // Production improvement
    const query = `DELETE FROM products WHERE id=$1 RETURNING *`;

    const result = await pool.query(query, [productId]);

    if(result.rowCount === 0){
        throw new ApiError("Product is not found", 404);
    }
    return;
}


module.exports = {
    fetchProducts,
    fetchProductById,
    createNew,
    findByNameAndCategory,
    updateProductById,
    deleteProduct,
    getTotalCount
}