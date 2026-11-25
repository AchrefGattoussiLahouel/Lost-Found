import {
  AuthentificationError,
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

class InvalidCredentialsError extends AuthentificationError {
  constructor() {
    super("Invalid email or password.", "INVALID_CREDENTIALS");
    this.messageKey = "errors.invalidCredentials";
  }
}

class TokenMissingError extends AuthentificationError {
  constructor() {
    super("Authentication token is required.", "TOKEN_MISSING");
    this.messageKey = "errors.tokenMissing";
  }
}

class TokenInvalidError extends AuthentificationError {
  constructor() {
    super("Authentication token is invalid.", "TOKEN_INVALID");
    this.messageKey = "errors.tokenInvalid";
  }
}

class TokenExpiredError extends AuthentificationError {
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

class AccountNotActiveError extends AuthentificationError {
  constructor() {
    super(
      "Your account is not active. Check if you have verified your email address or Please contact support.",
      "ACCOUNT_NOT_ACTIVE",
    );
    this.messageKey = "errors.accountNotActive";
  }
}
export  {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  InsufficientRoleError,
  AccountNotActiveError,
};
