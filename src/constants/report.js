export const REPORT_REASON = Object.freeze({
  FAKE: "fake",
  INAPPROPRIATE: "inappropriate",
  DUPLICATE: "duplicate",
  INCORRECT_INFO: "incorrect_info",
  PERSONAL_INFO: "personal_info",
  OTHER: "other",
});

export const REPORT_STATUS = Object.freeze({
  OPEN: "open",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
});

export const REPORT_PENDING_STATUSES = Object.freeze([
  REPORT_STATUS.OPEN,
  REPORT_STATUS.IN_REVIEW,
]);

export const REPORT_ACTION = Object.freeze({
  NONE: "none",
  HIDE_POST: "hide_post",
  DELETE_POST: "delete_post",
});
