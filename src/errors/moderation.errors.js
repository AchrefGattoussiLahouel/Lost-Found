import { AuthorizationError, ConflictError } from "./http.errors.js";

class ReportAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      { field: "declaration" },
      "You have already reported this declaration.",
    );
    this.code = "REPORT_ALREADY_EXISTS";
    this.messageKey = "errors.reportAlreadyExists";
  }
}

class ReportAlreadyClosedError extends ConflictError {
  constructor(status) {
    super({ status }, "This report has already been processed.");
    this.code = "REPORT_ALREADY_CLOSED";
    this.messageKey = "errors.reportAlreadyClosed";
  }
}

class CannotReportOwnDeclarationError extends AuthorizationError {
  constructor() {
    super("You cannot report your own declaration.");
    this.code = "CANNOT_REPORT_OWN_DECLARATION";
    this.messageKey = "errors.cannotReportOwnDeclaration";
  }
}

export {
  ReportAlreadyExistsError,
  ReportAlreadyClosedError,
  CannotReportOwnDeclarationError,
};
