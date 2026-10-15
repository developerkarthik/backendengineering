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

const insertRefreshToken = async (user_id, token_id, expiresAt, family_id, client = pool) => {
    const query = `INSERT INTO refresh_tokens(user_id, token_id, expires_at, family_id) VALUES($1, $2, $3, $4)`;

    console.log(user_id, token_id, expiresAt, family_id);
    const response = await client.query(query, [user_id, token_id, expiresAt, family_id]);

    return response.rows[0];
}

const validRefreshToken = async (user_id, jti) => {
    const query = `SELECT * FROM refresh_tokens WHERE user_id=$1 AND token_id=$2`;
    const response = await pool.query(query, [user_id, jti]);

    return response.rows[0];
}

const revokeRefreshToken = async (user_id, jti, client = pool) => {
    const query = `UPDATE refresh_tokens SET revoked_at=NOW() 
                        WHERE user_id=$1 
                            AND token_id=$2
                            AND revoked_at IS NULL
                            AND expires_at > NOW() 
                            RETURNING user_id, family_id`;
    return await client.query(query, [user_id, jti]);
}


const tokenTransaction = async (user, jti ) => {
    const client = await pool.connect();

    try{
        
        await client.query('BEGIN');

        const revoked = await revokeRefreshToken(user.id, jti, client);
        
        //console.log(revoked, jti);
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

        const family_id = revoked.rows[0].family_id;

        await insertRefreshToken(user.id, token_id, expiresAt, family_id, client);


        await client.query('COMMIT');

        return refreshToken;
    }catch(error){
        await client.query('ROLLBACK');

        throw error;
    }finally{
        client.release();
    }
}

const getTokenDetail = async (user_id, token_id) => {
    const query = `SELECT * FROM refresh_tokens WHERE user_id=$1 AND token_id=$2`;

    const response = await pool.query(query, [user_id, token_id]);

    //console.log(response);
    return response.rows[0];
}

const getFamilyByUserIdAndToken = (user_id, token_id) => {
    console.log(user_id, token_id);
    const query = `SELECT family_id FROM refresh_tokens 
                        WHERE user_id=$1 AND token_id=$2`;
    const response = pool.query(query, [user_id, token_id]);

    //console.log(response);
    return response;
}

const revokeTokenByFamilyId = async (user_id, family_id) => {
    const query = `UPDATE refresh_tokens SET revoked_at=NOW() 
                        WHERE user_id=$1 
                        AND family_id=$2 
                        AND revoked_at IS NULL`;

    const response = await pool.query(query, [user_id, family_id]);

    return response;
}

const revokeTokenByUserId = async (user_id) => {
    const query = `UPDATE refresh_tokens SET revoked_at=NOW() 
                        WHERE user_id=$1 
                        AND revoked_at IS NULL 
                        AND expires_at > NOW()`;

    const response = await pool.query(query, [user_id]);

    return response;
}

const createResetPasswordToken = async (user_id, token_hash) => {
    const expires_at = new Date(Date.now() + 15 * 1000 * 60);
    // Date.now - ms timestamp
    const query = `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`;

    // we can use postgreSQL simpler verison
    // INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
    const response = await pool.query(query, [user_id, token_hash, expires_at])

    return response;
}


const getResetPasswordToken = async (receivedHash) => {
    const query = `SELECT * FROM password_reset_tokens WHERE token_hash=$1 
                    AND expires_at > NOW()
                    AND used_at IS NULL`;

    const response = await pool.query(query, [receivedHash]);

    return response.rows.length > 0 ? response.rows[0] : null;
}

const resetPasswordTransaction = async (receivedHash, user_id, newPassword) => {
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        // Update new password
        const userQuery = `UPDATE users SET password=$1 WHERE id=$2`;
        await client.query(userQuery, [newPassword,user_id]);

        // Update token used at

        const tokenQuery = `UPDATE password_reset_tokens SET used_at=NOW() WHERE token_hash=$1`;
        await client.query(tokenQuery, [receivedHash]);

        await client.query('COMMIT');
        return true;
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
    tokenTransaction,
    getTokenDetail,
    revokeTokenByFamilyId,
    revokeTokenByUserId,
    getFamilyByUserIdAndToken,
    createResetPasswordToken,
    resetPasswordTransaction,
    getResetPasswordToken
}

