//const ApiError = require("../errors/ApiError");

//const attempts = new Map();

const bruteForceProtection = (req, res, next) => {
   const name = req.body.username; 

   const now = Date.now();

   const count = attempts.get(name).count ?? 0;

    attempts.set(name, {
        count: count + 1,
        attemptedAt: attempts.has(name) ? attempts.get(name).attemptedAt : Date.now()
    })
}

module.exports = {
    bruteForceProtection
}