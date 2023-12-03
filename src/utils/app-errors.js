class AppError extends Error {
    constructor(
        name,
        statusCode,
        description
    ) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
    }
}

class APIError extends AppError {
    constructor(
        name,
        statusCode,
        description
    ) {
        super(name, statusCode, description);
    }
}

module.exports = {
    AppError,
    APIError
};