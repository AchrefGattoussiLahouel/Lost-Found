import AppError from "./AppError.js";
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
  AccountSuspendedError,
} from "./auth.errors.js";

import {
  ContactRequiredError,
  PostNotFoundError,
  InvalidCategoryError,
  InvalidPlaceError,
  InvalidPostStatusError,
} from "./post.errors.js";

import {
  ReportNotFoundError,
  CannotReportOwnPostError,
  ReportAlreadyClosedError,
  ReportAlreadyExistsError,
  ReportStatusInvalidError,
} from "./report.errors.js";

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
  AccountSuspendedError,
  ContactRequiredError,
  PostNotFoundError,
  InvalidCategoryError,
  InvalidPlaceError,
  InvalidPostStatusError,
  ReportNotFoundError,
  CannotReportOwnPostError,
  ReportAlreadyClosedError,
  ReportStatusInvalidError,
  ReportAlreadyExistsError,
};
