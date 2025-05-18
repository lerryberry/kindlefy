const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsFunctionDB = err => {
    const val = err.errorResponse.errmsg.match(/"(.*?)"/)[0];
    const message = `Duplicate field: ${val}. Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    console.log(err.stack);
    res.status(err.statusCode).json({
        status: err.status, 
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    //operational, trusted error: send to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status, 
            message: err.message
        })
    //Programming or other exceptions
    } else {
        console.log('ERROR 😭', err);
        res.status(500).json({
            status: 'error',
            message: 'something went wrong :-('
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = err ;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsFunctionDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
}