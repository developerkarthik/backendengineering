const crypto = require('node:crypto');
const ApiError = require('../errors/ApiError');

const generateCsrfToken = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            return next(err)
        }

        const csrfToken = buffer.toString('hex');

        res.cookie("csrfToken",csrfToken, {
            httpOnly: false,
            SameSite: 'Lax'
        });

        next();
    })
}

const validateCsrfToken = (req, res, next) => {

    // Apply only for state changing request

    if(["GET", "HEAD", "OPTIONS"].includes(req.method)){
        return next();
    }

    const csrfCookie = req.cookies?.csrfToken;

    const csrfHeader = req.get('X-CSRF-Token');

    if(!csrfCookie || !csrfHeader){
        return next(
            new ApiError("CSRF token missing", 403)
        );
    }

    if (csrfCookie !== csrfHeader) {
        return next(
            new ApiError("Invalid CSRF token", 403)
        );
    }

    next();
}

module.exports = {
    generateCsrfToken,
    validateCsrfToken
}