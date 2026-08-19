class ApiError extends Error {
    constructor (message, statusCode, details){
        super(message);
        this.statusCode = statusCode;
        this.details = details || null;
    }
}

module.exports =  ApiError;