import AppError from "./AppError.js";
import ERROR_CODES from "./errorCodes.js";

export class BadRequestError extends AppError {
    constructor(details, message = "Invalid request") {
        super({
            ...ERROR_CODES.BAD_REQUEST,
            code: "BAD_REQUEST",
            details,
            message
        });
    }
}

export class ValidationError extends AppError {
    constructor(details, message = "One or more fields are invalid.") {
        super({
            ...ERROR_CODES.VALIDATION_ERROR,
            code: "VALIDATION_ERROR",
            details,
            message
        });
    }
}

export class AuthenticationError extends AppError {
    constructor(message = "Authentication required.", code = "UNAUTHENTICATED") {
        super({
            ...ERROR_CODES.UNAUTHENTICATED,
            code,
            message
        });
    }
}

export class AuthorizationError extends AppError {
    constructor(message = "You are not allowed to perform this action.") {
        super({
            ...ERROR_CODES.FORBIDDEN,
            code: "FORBIDDEN",
            message
        });
    }
}

export class NotFoundError extends AppError {
    constructor(resource, id) {
        super({
            ...ERROR_CODES.NOT_FOUND,
            code: "NOT_FOUND",
            details: { resource, id },
            message: `${resource} not found.`
        });
    }
}

export class ConflictError extends AppError {
    constructor(details, message = "Resource conflict.") {
        super({
            ...ERROR_CODES.CONFLICT,
            code: "CONFLICT",
            details,
            message
        });
    }
}

export class PayloadTooLargeError extends AppError {
    constructor() {
        super({
            ...ERROR_CODES.PAYLOAD_TOO_LARGE,
            code: "PAYLOAD_TOO_LARGE"
        });
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter) {
        super({
            ...ERROR_CODES.RATE_LIMIT_EXCEEDED,
            code: "RATE_LIMIT_EXCEEDED",
            retryable: true,
            details: retryAfter ? { retryAfter } : undefined
        });
    }
}

export class InternalError extends AppError {
    constructor(cause) {
        super({
            ...ERROR_CODES.INTERNAL_SERVER_ERROR,
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected server error occurred.",
            cause
        });
    }
}

export class DependencyError extends AppError {
    constructor(cause) {
        super({
            ...ERROR_CODES.EXTERNAL_DEPENDENCY_FAILURE,
            code: "EXTERNAL_DEPENDENCY_FAILURE",
            retryable: false,
            cause
        });
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(cause) {
        super({
            ...ERROR_CODES.SERVICE_UNAVAILABLE,
            code: "SERVICE_UNAVAILABLE",
            retryable: true,
            cause
        });
    }
}

export class TimeoutError extends AppError {
    constructor(cause) {
        super({
            ...ERROR_CODES.DEPENDENCY_TIMEOUT,
            code: "DEPENDENCY_TIMEOUT",
            retryable: true,
            cause
        });
    }
}

export default {
    BadRequestError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    PayloadTooLargeError,
    RateLimitError,
    InternalError,
    DependencyError,
    ServiceUnavailableError,
    TimeoutError
};
