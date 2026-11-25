import { AppError } from "./AppError.js";

export class ReportNotFoundError extends AppError {
  constructor() {
    super({
      status: 404,
      code: "REPORT_NOT_FOUND_ERROR",
      messageKey: "errors.report.reportNotFound",
      message: "Report not found.",
    });
  }
}

export class CannotReportOwnPostError extends AppError {
  constructor() {
    super({
      status: 403,
      code: "CANNOT_REPORT_OWN_POST",
      messageKey: "errors.report.cannotReportOwnPost",
      message: "You cannot report your own post.",
    });
  }
}

export class ReportAlreadyExistsError extends AppError {
  constructor() {
    super({
      status: 409,
      code: "REPORT_ALREADY_EXISTS",
      messageKey: "errors.report.alreadyExists",
      message: "You have already reported this post.",
    });
  }
}

export class ReportAlreadyClosedError extends AppError {
  constructor(status) {
    super({
      status: 409,
      code: "REPORT_ALREADY_CLOSED",
      messageKey: "errors.report.alreadyClosed",
      message: "This report has already been processed.",
      details: { status },
    });
  }
}

export class ReportStatusInvalidError extends AppError {
  constructor(status) {
    super({
      status: 400,
      code: "REPORT_STATUS_INVALID",
      messageKey: "errors.report.invalidStatus",
      message: "The requested report status is invalid.",
      details: { status },
    });
  }
}
