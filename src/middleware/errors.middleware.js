const DBMSG = require("../config/DBErrorMapping");

const errorHandler = (err, req, res, next) => {

    if(err.code === '23505' || 
        err.code === '23514' || 
        err.code === '23503' || 
        err.code === '23502'){
        err.message = DBMSG[err.constraint] || 'Database violation.';
        err.statusCode = err.code === '23505' ? 409 : 400;
    }

    console.log(err);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Unexpected server error',
        details: err.details || null
    });
}

module.exports = errorHandler;