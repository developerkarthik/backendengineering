const bcrypt = require('bcrypt');
const authRepository = require('../repositories/auth.repository');
const { generateJwtToken } = require('../utils/auth');
const ApiError = require('../errors/ApiError');

const userLogin = async (username, password) => {
    const response = await authRepository.checkUser(username);
    const hashPassword = response[0].password;

    const validatePassword = await bcrypt.compare(password, hashPassword);
    if(!validatePassword){
        throw new ApiError('Username/Password is not match', 401);
    }

    const token = generateJwtToken({ name: response[0].name});
        //console.log(token);

    //console.log(token);
    return { token };
}

const userRegister = async (username, password) => {
    return await authRepository.userRegister(username, password);
}

module.exports = {
    userLogin,
    userRegister
}