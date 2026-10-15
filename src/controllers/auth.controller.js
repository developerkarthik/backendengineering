const jwt = require('jsonwebtoken');
const authServices = require('../services/auth.services');
const userServices = require('../services/user.services');

const ApiError = require('../errors/ApiError');
const { recordFailedLogin, clearFailedLogins, recoredFailedLoginIp } = require('../services/rateLimit.service');


const generateNewTokens = async (req, res, next) => {
    try{
        const { id, jti} = req.user;

        const { accessToken, refreshToken } = await authServices.regenerateTokens(id, jti);

        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure:true,
            sameSite: 'strict', // CSRF protection - level 1
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure:true,
            sameSite: 'strict', // CSRF protection - level 1
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'Token refresh successfully!'
        });

    }catch(error){
        next(error);
    }
}
const loginController = async (req, res, next) => {
    const { username, password } = req.body;
    const ip = req.ip;

    try{
       const result = await authServices.userLogin(username, password);

       const accountDisabled = await userServices.getUserIsActive(username);

       if(!accountDisabled){
            throw new ApiError('Account is disabled/inactive', 403);
       }

       // Successful login: clear previous failures.
       await clearFailedLogins(username);

       res.cookie("access_token", result.accessToken, {
        httpOnly: true,
        secure:true,
        sameSite: 'strict', // CSRF protection - level 1
        maxAge: 15 * 60 * 1000
       })

       res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure:true,
        sameSite: 'strict', // CSRF protection - level 1
        maxAge: 7 * 24 * 60 * 60 * 1000
       })

       res.status(200).json({
            message: 'Login successfully!'
        });
    }catch(error){
        //console.log(error)
        if(error.statusCode === 401){
            
            try{
                const result = await recordFailedLogin(username);
                const resultIp = await recoredFailedLoginIp(ip);
                if(result.blocked || resultIp.blocked){
                    return next(new ApiError('Too many request. Please try again after sometime.', 429))
                }
            }catch(error) {
                return next(error);
            }
        }
        return next(error);
    }
}

const registerController = async (req, res, next) => {
    try{
        const { username, password } = req.body;
        await authServices.userRegister(username, password);
        res.status(200).json({
            message: 'User account created!'
        });
    }catch(error){
        next(error);
    }
}

const forgetPwdController = async (req, res, next) => {
    const { username } = req.body;
    try{
        await authServices.forgetPassword(username);
        
        res.status(200).json({
            message: 'Please check your email for reset password link.'
        });
    }catch(error){
        next(error);
    }
} 

const resetPwdController = async (req, res, next) => {
    
    try{
        const { password } = req.body;
        const token = req.query?.token;

        if(!token){
            throw new ApiError('Token is missing or not valid!', 403);
        }
        await authServices.resetPassword(token, password);
        
        res.status(200).json({
            message: 'Your password updated successfully!.'
        });
    }catch(error){
        next(error);
    }
} 

const logoutController = async (req, res, next) => {
    try{
        const { id, jti} = req.user;

        await authServices.logoutSession(id, jti);
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        return res.status(200).json({
            message: "Logged out successfully"
        });
    }catch(error){
        next(error);
    }
}


const logoutAllController = async (req, res, next) => {
    try{
        const { id } = req.user;

        await authServices.logoutAllSession(id);
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        return res.status(200).json({
            message: "Logged out successfully"
        });
    }catch(error){
        next(error);
    }
}

const getUser = async (req, res, next) => {
    try{
        const user = req.user;
        const decoded = jwt.verify(req.cookies.refresh_token, process.env.JWT_REFRESH_TOKEN_KEY);
        
        await authServices.checkSessionValid(user.id, decoded.jti);


        //console.log(user);
        return res.status(200).json({
            data: user
        })
    }catch(error){
        next(error);
    }
    
}



module.exports = {
    loginController,
    registerController,
    getUser,
    generateNewTokens,
    logoutController,
    logoutAllController,
    forgetPwdController,
    resetPwdController
}