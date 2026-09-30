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

    //console.log(response);
    return response.rows.length > 0 ? response.rows[0] : null;
}

const getPermissionsLevel = async (username) => {
    const query = `SELECT u.name, r.name, p.name FROM users u
                    JOIN roles r ON r.id = u.role_id 
                    JOIN role_permissions rp ON r.id = rp.role_id
                    JOIN permissions p ON p.id = rp.permission_id
                    WHERE u.name = $1`;
    const response = await pool.query(query, [username]);

    //console.log(response.rows);

    return response.rows;
}

const insertRefreshToken = async (user_id, token_id, expiresAt) => {
    const query = `INSERT INTO refresh_tokens(user_id, token_id, expires_at) VALUES($1, $2, $3)`;

    const response = await pool.query(query, [user_id, token_id, expiresAt]);

    return response.rows[0];
}

const validRefreshToken = async (user_id, jti) => {
    const query = `SELECT * FROM refresh_tokens WHERE user_id=$1 AND token_id=$2`;
    const response = await pool.query(query, [user_id, jti]);

    return response.rows[0];
}

const revokeRefreshToken = async (user_id, token_id) => {
    const query = `UPDATE refresh_tokens SET revoked_at=NOW() 
                        WHERE user_id=$1 
                            AND token_id=$2
                            AND revoked_at IS NULL
                            AND expires_at > NOW() 
                            RETURNING user_id`;
    const response = await pool.query(query, [user_id, token_id]);
    return response.rows[0];
}


module.exports = {
    checkUser,
    userRegister,
    getRole,
    getPermissionsLevel,
    insertRefreshToken,
    validRefreshToken,
    revokeRefreshToken
}

