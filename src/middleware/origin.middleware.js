const ApiError = require("../errors/ApiError");


const ALLOWED_ORIGIN = "http://localhost:5173";

const validateOrigin = (req, res, next) => {
    const origin = req.get("Origin");

    if (!origin) {
        return next(new ApiError("Origin header missing", 403));
    }

    if (origin !== ALLOWED_ORIGIN) {
        return next(new ApiError("Invalid origin", 403));
    }

    next();
};

module.exports = validateOrigin;