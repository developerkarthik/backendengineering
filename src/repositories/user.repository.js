const pool = require('../config/db');


const getAllUsers = async () => {
    const query = `SELECT name, email, role_id  FROM users`;
    
    const response = await pool.query(query);

    //console.log(response);
    return response.rows;
}

const getUserById = async (userId) => {
    const query = `SELECT id, name, role_id, is_active FROM users WHERE id=$1`;
    const response = await pool.query(query, [userId]);
    return response.rows.length > 0 ? response.rows[0] : null;
}

const getUserIsActive = async (username) => {
    const query = `SELECT id, is_active FROM users WHERE name=$1`;
    const response = await pool.query(query, [username]);
    return response.rows.length > 0 ? response.rows[0].is_active : null;
}

const updateUserStatus = async (userId, status) => {
    const query = `UPDATE users SET is_active=$1 WHERE id=$2`;
    const response = await pool.query(query, [status, userId]);

    return response;
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus,
    getUserIsActive
}