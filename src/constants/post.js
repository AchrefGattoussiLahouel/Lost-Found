export const INTENTS = Object.freeze({ LOST: "lost", FOUND: "found" });

export const POST_STATUS = Object.freeze({
  ACTIVE: "active",
  MATCHED: "matched",
  CLOSED: "closed",
});

export const CLOSE_REASONS = Object.freeze({
  RESOLVED: "resolved",
  EXPIRED: "expired",
  DELETED_BY_USER: "deleted_by_user",
  MATCH_REFUSED: "match_refused",
  MODERATION: "moderation",
});

export const CUSTODY_STATE = Object.freeze({
  WITH_FINDER: "with_finder",
  DEPOSIT_REQUIRED: "deposit_required",
  OFFICE_PENDING: "office_pending",
  AT_OFFICE: "at_office",
  RETURNED: "returned",
});

export const DEPOSIT_REASONS = Object.freeze({
  WANTED_TO_RETURN: "wanted_to_return",
  MATCH_REFUSED: "match_refused",
  NO_MATCH: "no_match",
  DEADLINE_PASSED: "deadline_passed",
});

export const RETENTION_DAYS = 30; // time to keep a post before it is automatically closed
export const DEPOSIT_WINDOW_MINUTES = 1; // time to return the item to the office after a post of found is made


export const JOB_INTERVAL_MS = 60 * 1000;   // les jobs tournent chaque minute

export const EVENTS = Object.freeze({
  DEPOSIT_REQUIRED: "post.deposit_required",
  DEPOSIT_DECLARED: "post.deposit_declared",
  RECEIVED_AT_OFFICE: "post.received_at_office",
  OVERDUE: "post.overdue",
});