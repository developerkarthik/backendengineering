const pool = require('../config/db');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { generateRefreshToken } = require('../utils/auth');
const ApiError = require('../errors/ApiError');

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

const insertRefreshToken = async (client, user_id, token_id, expiresAt) => {
    const query = `INSERT INTO refresh_tokens(user_id, token_id, expires_at) VALUES($1, $2, $3)`;

    const response = await client.query(query, [user_id, token_id, expiresAt]);

    return response.rows[0];
}

const validRefreshToken = async (user_id, jti) => {
    const query = `SELECT * FROM refresh_tokens WHERE user_id=$1 AND token_id=$2`;
    const response = await pool.query(query, [user_id, jti]);

    return response.rows[0];
}

const revokeRefreshToken = async (client, user_id, jti) => {
    const query = `UPDATE refresh_tokens SET revoked_at=NOW() 
                        WHERE user_id=$1 
                            AND token_id=$2
                            AND revoked_at IS NULL
                            AND expires_at > NOW() 
                            RETURNING user_id`;
    return await client.query(query, [user_id, jti]);
}


const tokenTransaction = async (user, jti ) => {
    const client = await pool.connect();

    try{
        
        await client.query('BEGIN');

        const revoked = await revokeRefreshToken(client, user.id, jti);
        console.log(revoked, jti);
        if(revoked.rowCount === 0){
            throw new ApiError('Refresh token is invalid or already used', 401);
        }

        const token_id = crypto.randomUUID();
        const refreshToken = generateRefreshToken({
            sub: user.name,
            id: user.id,
            jti: token_id
        });

        const decoded = jwt.decode(refreshToken);
        const expiresAt = new Date(decoded.exp * 1000);

        await insertRefreshToken(client, user.id, token_id, expiresAt);


        await client.query('COMMIT');

        return refreshToken;
    }catch(error){
        await client.query('ROLLBACK');

        throw error;
    }finally{
        client.release();
    }
}

module.exports = {
    checkUser,
    userRegister,
    getRole,
    getPermissionsLevel,
    insertRefreshToken,
    validRefreshToken,
    revokeRefreshToken,
    tokenTransaction
}

