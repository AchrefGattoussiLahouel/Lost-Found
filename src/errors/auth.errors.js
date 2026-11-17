import {
    AuthenticationError,
    AuthorizationError,
    ConflictError
} from "./http.errors.js";

export class EmailAlreadyExistsError extends ConflictError {
    constructor() {
        super(
            { field: "email" },
            "An account with this email already exists."
        );

        this.code = "EMAIL_ALREADY_EXISTS";
        this.messageKey = "errors.emailAlreadyExists";
    }
}

export class InvalidCredentialsError extends AuthenticationError {
    constructor() {
        super("Invalid email or password.", "INVALID_CREDENTIALS");
        this.messageKey = "errors.invalidCredentials";
    }
}

export class TokenMissingError extends AuthenticationError {
    constructor() {
        super("Authentication token is required.", "TOKEN_MISSING");
        this.messageKey = "errors.tokenMissing";
    }
}

export class TokenInvalidError extends AuthenticationError {
    constructor() {
        super("Authentication token is invalid.", "TOKEN_INVALID");
        this.messageKey = "errors.tokenInvalid";
    }
}

export class TokenExpiredError extends AuthenticationError {
    constructor() {
        super("Authentication token has expired.", "TOKEN_EXPIRED");
        this.messageKey = "errors.tokenExpired";
    }
}

export class InsufficientRoleError extends AuthorizationError {
    constructor() {
        super("You do not have permission to access this resource.");
        this.code = "INSUFFICIENT_ROLE";
        this.messageKey = "errors.insufficientRole";
    }
}

export default {
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    TokenMissingError,
    TokenInvalidError,
    TokenExpiredError,
    InsufficientRoleError
};
