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
    
    const role = await authRepository.getRole(user.role_id);

    if(!role){
        throw new ApiError("Role doesn't exists", 404);
    }

    

    const accessToken = generateJwtToken({
        sub: user.name,
        id: user.id,
        role: role.name
    });
    
    await checkLegacySession(id, jti);
    const refreshToken = await authRepository.tokenTransaction(user, jti);

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

    // console.log(token_id);
    const family_id = crypto.randomUUID();

    await authRepository.insertRefreshToken(response[0].id, token_id, expiresAt, family_id);
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

const checkSessionValid = async (user_id, token_id) => {
    // console.log(user_id, token_id);
    const result = await authRepository.getTokenDetail(user_id, token_id);

    //console
    if(result.is_legacy_session){
        throw new ApiError('[Legacy] Session expired/invalid. Please login again', 401);
    }

    if(result.revoked_at !== null){
        throw new ApiError('Session expired. Please login again', 401);
    }

    return true;
}


const logoutSession = async (user_id, token_id) => {
    const familyResult = await authRepository.getFamilyByUserIdAndToken(user_id, token_id);

    if(familyResult.rowCount === 0){
        throw new ApiError('Family ID is missing. So, please login again', 401);
    }

    await authRepository.revokeTokenByFamilyId(user_id, familyResult.rows[0].family_id);

    return true;
}

const logoutAllSession = async (user_id) => {
    const result = await authRepository.revokeTokenByUserId(user_id);

    if(result.rowCount === 0){
        throw new ApiError('Already revoked!. Please login again', 401);
    }

    //await authRepository.revokeTokenByFamilyId(user_id, familyResult.rows[0].family_id);

    return true;
}

module.exports = {
    userLogin,
    userRegister,
    getUserPermissions,
    regenerateTokens,
    checkSessionValid,
    logoutSession,
    logoutAllSession
}