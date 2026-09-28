const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');
const authRepository = require('../repositories/auth.repository');
const authServices = require('../services/auth.services');

const hashPassword = async (req, res, next) => {
    const password_hash = await bcrypt.hash(req.body.password, 10);
    req.body = {
        ...req.body,
        password: password_hash
    }

    next();
}

const authenticate = async (req, res, next) => {
    try{
        const token = req.cookies.access_token;

        
        console.log(token);

        if(!token){
            return res.status(401).json({
                message: 'unauthenticated!'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        console.log(decoded);
        
        req.user = decoded;

        next();
        
    }catch(error){
        console.log(error);
        next(error)
    }
}

const authorize = (allowedPermissions) => {
    return async (req, res, next) => {
        const subject = req.user.sub;

        const userPermissions = await authServices.getUserPermissions(subject)
        
        console.log(userPermissions);
        //const hasPermission = allowedPermissions.every(permission => userPermissions.includes(permission))
        const hasPermission = userPermissions.includes(allowedPermissions)

        if(!hasPermission){
            throw new ApiError("You don't have a permission!", 403);
        }

        // if(!allowedRoles.includes(role)){
        //     throw new ApiError("You don't have a permission!", 403);
        // }

        next();
    }
}

module.exports = {
    hashPassword,
    authenticate,
    authorize
}