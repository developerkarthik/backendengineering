const pool = require('../config/db');


const getAllUsers = async () => {
    const query = `SELECT name, email, role_id  FROM users`;
    
    const response = await pool.query(query);

    //console.log(response);
    return response.rows;
}

const getUserById = async (userId) => {
    const query = `SELECT id, name, role_id FROM users WHERE id=$1`;
    const response = await pool.query(query, [userId]);
    return response.rows.length > 0 ? response.rows[0] : null;
}

module.exports = {
    getAllUsers,
    getUserById
}