const pool = require('../config/db');

const checkUser = async (username) => {
    const query = `SELECT * FROM users WHERE name=$1`
    const response = await pool.query(query, [username]);
    // console.log(response);
    return response.rows;   
}

const userRegister = async (username, password) => {

    const userExists = await checkUser(username);
    
    if(userExists.length > 0){
        throw new Error('User already exists!')
    }

    const query = `INSERT INTO users(name, password) VALUES($1, $2)`;
    const response = await pool.query(query, [username, password]);
    //console.log(response);
    return response;
}

const getRole = async (role_id) => {
    const query = `SELECT * FROM roles WHERE id=$1`;

    const response = await pool.query(query, [role_id]);

    console.log(response);
    return response.rows[0];
}

const getPermissionsLevel = async (username) => {
    const query = `SELECT u.name, r.name, p.name FROM users u
                    JOIN roles r ON r.id = u.role_id 
                    JOIN role_permissions rp ON r.id = rp.role_id
                    JOIN permissions p ON p.id = rp.permission_id
                    WHERE u.name = $1`;
    const response = await pool.query(query, [username]);

    console.log(response.rows);

    return response.rows;
}

module.exports = {
    checkUser,
    userRegister,
    getRole,
    getPermissionsLevel
}

