import { AppError } from "./AppError.js";
import ERROR_CODES from "./errorCodes.js";

import {
  BadRequestError,
  ValidationError,
  AuthentificationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  RateLimitError,
  InternalError,
  DependencyError,
  ServiceUnavailableError,
  TimeoutError,
} from "./http.errors.js";

import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  InsufficientRoleError,
  AccountNotActiveError,
} from "./auth.errors.js";

import {
  ContactRequiredError,
  DeclarationNotFoundError,
  InvalidCategoryError,
  InvalidPlaceError,
} from "./declarations.errors.js";

export default {
  AppError,
  ERROR_CODES,
  BadRequestError,
  ValidationError,
  AuthentificationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  RateLimitError,
  InternalError,
  DependencyError,
  ServiceUnavailableError,
  TimeoutError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  TokenMissingError,
  TokenInvalidError,
  TokenExpiredError,
  InsufficientRoleError,
  AccountNotActiveError,
  ContactRequiredError,
  DeclarationNotFoundError,
  InvalidCategoryError,
  InvalidPlaceError,
};
