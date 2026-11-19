export const REPORT_REASON = Object.freeze({
  FAKE: "fake",
  INAPPROPRIATE: "inappropriate",
  DUPLICATE: "duplicate",
  INCORRECT_INFO: "incorrect_info",
  PERSONAL_INFO: "personal_info", // personal data published by mistake
  OTHER: "other",
});

export const REPORT_STATUS = Object.freeze({
  OPEN: "open",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved", // report was justified, action taken
  DISMISSED: "dismissed", // report was unfounded, declaration left untouched
});

// Statuses for which a report is still "pending" (not yet closed)
export const REPORT_PENDING_STATUSES = Object.freeze([
  REPORT_STATUS.OPEN,
  REPORT_STATUS.IN_REVIEW,
]);

// Action an admin can take while resolving a report
export const REPORT_ACTION = Object.freeze({
  NONE: "none",
  HIDE_DECLARATION: "hide_declaration",
  DELETE_DECLARATION: "delete_declaration",
});
