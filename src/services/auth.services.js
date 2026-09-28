const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');
const { generateJwtToken } = require('../utils/auth');
const ApiError = require('../errors/ApiError');

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
    const token = generateJwtToken({ 
        sub: response[0].name, 
        role: roleRes.name, 
        id: response[0].id
    });
        //console.log(token);

    //console.log(token);
    return { token };
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
    getUserPermissions
}