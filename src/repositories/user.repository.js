const pool = require('../config/db');


const getAllUsers = async () => {
    const query = `SELECT name, email, role_id  FROM users`;
    
    const response = await pool.query(query);

    //console.log(response);
    return response.rows;
}

module.exports = {
    getAllUsers
}