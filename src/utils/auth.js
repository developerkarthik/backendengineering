const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

const generateJwtToken = (data) => {
    //console.log(process.env.JWT_SECRET_KEY);
    const accessToken = jwt.sign(
            data, 
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "15m",
                issuer: 'http://localhost:8000',
                audience: 'http://localhost:5173'
            });
    return accessToken;
}

const generateRefreshToken = (data) => {
    //const {sub} = data;
    const refreshToken = jwt.sign(
        data, 
        process.env.JWT_REFRESH_TOKEN_KEY, 
        {
            expiresIn: "7d",
            issuer: 'http://localhost:8000',
            audience: 'http://localhost:5173'
        }
    );
    return refreshToken;
}


module.exports = {
    generateJwtToken,
    generateRefreshToken
}