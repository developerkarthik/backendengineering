const jwt = require('jsonwebtoken');
const authServices = require('../services/auth.services');

const loginController = async (req, res, next) => {
    try{
       const { username, password } = req.body;
       const result = await authServices.userLogin(username, password);
       res.cookie("access_token", result.token, {
        httpOnly: true,
        secure:true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
       })
       res.status(200).json({
            message: 'Login successfully!'
        });
    }catch(error){
        next(error);
    }
}

const registerController = async (req, res, next) => {
    try{
        const { username, password } = req.body;
        await authServices.userRegister(username, password);
        res.status(200).json({
            message: 'User login successfully!'
        });
    }catch(error){
        next(error);
    }
}

const getUser = (req, res) => {
    const user = req.user;

    return res.status(200).json({
        data: user
    })
}



module.exports = {
    loginController,
    registerController,
    getUser
}