const jwt = require('jsonwebtoken');


const generateJwtToken = (data) => {
    console.log(process.env.JWT_SECRET_KEY);
    const accessToken = jwt.sign(JSON.stringify(data), process.env.JWT_SECRET_KEY);
    return accessToken;
}

module.exports = {
    generateJwtToken
}