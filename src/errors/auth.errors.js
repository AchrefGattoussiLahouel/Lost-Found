import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
} from "./http.errors.js";

class EmailAlreadyExistsError extends ConflictError {
  constructor() {
    super({ field: "email" }, "An account with this email already exists.");

    this.code = "EMAIL_ALREADY_EXISTS";
    this.messageKey = "errors.emailAlreadyExists";
  }
}

class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super("Invalid email or password.", "INVALID_CREDENTIALS");
    this.messageKey = "errors.invalidCredentials";
  }
}

class TokenMissingError extends AuthenticationError {
  constructor() {
    super("Authentication token is required.", "TOKEN_MISSING");
    this.messageKey = "errors.tokenMissing";
  }
}

class TokenInvalidError extends AuthenticationError {
  constructor() {
    super("Authentication token is invalid.", "TOKEN_INVALID");
    this.messageKey = "errors.tokenInvalid";
  }
}

class TokenExpiredError extends AuthenticationError {
  constructor() {
    super("Authentication token has expired.", "TOKEN_EXPIRED");
    this.messageKey = "errors.tokenExpired";
  }
}

class InsufficientRoleError extends AuthorizationError {
  constructor() {
    super("You do not have permission to access this resource.");
    this.code = "INSUFFICIENT_ROLE";
    this.messageKey = "errors.insufficientRole";
  }
}

class AccountNotActiveError extends AuthenticationError {
  constructor() {
    super(
      "Your account is not active. Check if you have verified your email address or Please contact support.",
      "ACCOUNT_NOT_ACTIVE",
    );
    this.messageKey = "errors.accountNotActive";
  }
}

class AccountSuspendedError extends AuthenticationError {
  constructor() {
    super(
      "Your account is suspended due to policy violations. Please contact support for more information.",
      "ACCOUNT_SUSPENDED",
    );
    this.messageKey = "errors.accountSuspended";
  }
}

export {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  InsufficientRoleError,
  AccountNotActiveError,
  AccountSuspendedError,
};
