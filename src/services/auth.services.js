const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');
const userRepository = require('../repositories/user.repository');
const { generateJwtToken, generateRefreshToken } = require('../utils/auth');
const ApiError = require('../errors/ApiError');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');


const regenerateTokens = async (id, jti) => {
    const user = await userRepository.getUserById(id);

    if(!user){
        throw new ApiError("User doesn't exists", 404);
    }
    // Check the refresh token is active or not. (token_id, userId)
    const isTokenActive = await authRepository.validRefreshToken(id, jti);
    // console.log(isTokenActive);
    if(isTokenActive.revoked_at){
        throw new ApiError('Refresh token is already revoked/theft. Please login again', 401);
    }

    const role = await authRepository.getRole(user.role_id);

    if(!role){
        throw new ApiError("Role doesn't exists", 404);
    }

    

    const accessToken = generateJwtToken({
        sub: user.name,
        id: user.id,
        role: role.name
    });

    const token_id = crypto.randomUUID();
    const expiresAt = new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            );
    const refreshToken = generateRefreshToken({
        sub: user.name,
        id: user.id,
        jti: token_id
    });

    const revoked = await authRepository.revokeRefreshToken(id, jti);
    if (!revoked) {
        throw new ApiError(
            'Refresh token is invalid, expired, or already used',
            401
        );
    }

    await authRepository.insertRefreshToken(id, token_id, expiresAt);


    return {
        accessToken,
        refreshToken
    }

}

const userLogin = async (username, password) => {
    const response = await authRepository.checkUser(username);

    //console.log(response);
    if(response.length === 0) {
        throw new ApiError('Username/Password is not match', 401);
    }

    const hashPassword = response[0].password;

    const validatePassword = await bcrypt.compare(password, hashPassword);
    if(!validatePassword){
        throw new ApiError('Username/Password is not match', 401);
    }

    const roleRes = await authRepository.getRole(response[0].role_id);

    //console.log(roleRes);
    const accessToken = generateJwtToken({ 
        sub: response[0].name, 
        role: roleRes.name, 
        id: response[0].id
    });

    const token_id = crypto.randomUUID();
    const expiresAt = new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            );

    const refreshToken = generateRefreshToken({
        sub: response[0].name,
        id: response[0].id,
        jti: token_id
    });

    console.log(token_id);
    await authRepository.insertRefreshToken(response[0].id, token_id, expiresAt);
        //console.log(token);

    //console.log(token);
    return { accessToken, refreshToken };
}

const userRegister = async (username, password) => {
    return await authRepository.userRegister(username, password);
}


const getUserPermissions = async (subject) => {
    const result = await authRepository.getPermissionsLevel(subject);
    return result.map(res => res.name);
}


module.exports = {
    userLogin,
    userRegister,
    getUserPermissions,
    regenerateTokens
}