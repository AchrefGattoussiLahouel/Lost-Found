import {
    AppError,
    ValidationError,
    ConflictError,
    BadRequestError,
    PayloadTooLargeError,
    InternalError,
    TokenInvalidError,
    TokenExpiredError
} from "../errors/index.js";

const normalizeError = (err) => {
    // Malformed JSON body
    if (err.type === "entity.parse.failed") {
        return new BadRequestError(
            undefined,
            "Malformed JSON request body."
        );
    }

    // Request body exceeds configured limit
    if (err.type === "entity.too.large") {
        return new PayloadTooLargeError();
    }

    // Duplicate MongoDB value (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];

        return new ConflictError(
            field ? { field } : undefined,
            "A resource with this value already exists."
        );
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        return new BadRequestError(
            { field: err.path },
            "Invalid resource identifier."
        );
    }

    // Mongoose document validation
    if (err.name === "ValidationError" && err.errors) {
        const details = {};

        for (const [field, issue] of Object.entries(err.errors)) {
            details[field] = [{
                code: "INVALID_VALUE",
                params: {}
            }];
        }

        return new ValidationError(details);
    }

    // JWT errors
    if (err.name === "TokenExpiredError") {
        return new TokenExpiredError();
    }

    if (
        err.name === "JsonWebTokenError" ||
        err.name === "NotBeforeError"
    ) {
        return new TokenInvalidError();
    }

    // Unknown errors must not expose internal information
    return new InternalError(err);
};

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const error = err instanceof AppError
        ? err
        : normalizeError(err);

    // Server-side logging only. Never send stack traces to clients.
    if (error.status >= 500) {
        console.error({
            code: error.code,
            status: error.status,
            path: req.originalUrl,
            correlationId: req.id,
            error: err
        });
    } else {
        console.warn({
            code: error.code,
            status: error.status,
            path: req.originalUrl
        });
    }

    // Support Retry-After for rate-limiting errors
    if (error.details?.retryAfter) {
        res.set("Retry-After", String(error.details.retryAfter));
    }

    return res.status(error.status).json({
        error: {
            code: error.code,
            message: error.message,
            correlation_id: req.id || null,
            retryable: error.retryable,
            ...(error.details !== undefined && {
                details: error.details
            })
        }
    });
};

export default errorHandler;
