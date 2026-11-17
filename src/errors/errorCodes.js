
const ERROR_CODES = Object.freeze({
    BAD_REQUEST: {
        status: 400,
        messageKey: "errors.badRequest"
    },
    VALIDATION_ERROR: {
        status: 422,
        messageKey: "errors.validation"
    },
    UNAUTHENTICATED: {
        status: 401,
        messageKey: "errors.unauthenticated"
    },
    FORBIDDEN: {
        status: 403,
        messageKey: "errors.forbidden"
    },
    NOT_FOUND: {
        status: 404,
        messageKey: "errors.notFound"
    },
    CONFLICT: {
        status: 409,
        messageKey: "errors.conflict"
    },
    PAYLOAD_TOO_LARGE: {
        status: 413,
        messageKey: "errors.payloadTooLarge"
    },
    RATE_LIMIT_EXCEEDED: {
        status: 429,
        messageKey: "errors.rateLimit"
    },
    INTERNAL_SERVER_ERROR: {
        status: 500,
        messageKey: "errors.internal"
    },
    EXTERNAL_DEPENDENCY_FAILURE: {
        status: 502,
        messageKey: "errors.dependency"
    },
    SERVICE_UNAVAILABLE: {
        status: 503,
        messageKey: "errors.unavailable"
    },
    DEPENDENCY_TIMEOUT: {
        status: 504,
        messageKey: "errors.timeout"
    }
});

module.exports = ERROR_CODES;
