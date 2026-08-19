const errorHandler = (err, req, res, next) => {

    console.log(err);

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Unexpected server error',
        details: err.details || null
    });
}

module.exports = errorHandler;