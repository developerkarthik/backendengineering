const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
        
        req.user = decoded;

        next();
        
    }catch(error){
        console.log(error);
        next(error)
    }
}

module.exports = {
    hashPassword,
    authenticate
}