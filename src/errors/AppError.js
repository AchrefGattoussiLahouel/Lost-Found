
class AppError extends Error {
    constructor({
        status,
        code,
        messageKey,
        message,
        details,
        retryable = false,
        cause
    }) {
        super(message || code, { cause });

        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.messageKey = messageKey;
        this.details = details;
        this.retryable = retryable;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
