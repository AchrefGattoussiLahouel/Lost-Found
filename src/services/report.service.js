import Report from "../models/report.js";
import { getDeclarationModel } from "./modelRegistry.js";
import moderationService from "./moderation.service.js";
import auditService from "./audit.service.js";
import notifyService from "./notify.service.js";
import Errors from "../errors/index.js";
import ROLES from "../constants/roles.js";
import {
  REPORT_STATUS,
  REPORT_PENDING_STATUSES,
  REPORT_ACTION,
} from "../constants/report.js";
import {
  MODERATION_ACTION,
  TARGET_TYPE,
  NOTIFICATION_TYPE,
} from "../constants/moderation.js";
import { getSkip, buildMeta } from "../utils/pagination.js";

// Number of pending reports after which a declaration is hidden automatically
// (0 disables). Hiding is reversible and reviewed by a moderator.
const getAutoHideThreshold = () => {
  const raw = process.env.REPORT_AUTO_HIDE_THRESHOLD;
  return raw === undefined || raw === "" ? 5 : Number(raw);
};

const maybeAutoHide = async (declarationId) => {
  const threshold = getAutoHideThreshold();
  if (!(threshold > 0)) return;

  try {
    const pending = await Report.countDocuments({
      declaration: declarationId,
      status: { $in: REPORT_PENDING_STATUSES },
    });

    if (pending >= threshold) {
      await moderationService.hide(
        declarationId,
        null,
        `Auto-hidden: ${pending} pending reports`,
        { auto: true },
      );
    }
  } catch (error) {
    // Never fail the user's report because of the auto-hide rule
    console.error("[report] auto-hide failed:", error.message);
  }
};

// ---------------------------------------------------------------- user side
const create = async (reporter, { declaration, reason, description }) => {
  const Declaration = getDeclarationModel();
  const target = await Declaration.findById(declaration);

  if (!target || target.deletedAt) {
    throw new Errors.NotFoundError("Declaration", declaration);
  }

  if (String(target.owner) === String(reporter._id)) {
    throw new Errors.CannotReportOwnDeclarationError();
  }

  let report;
  try {
    report = await Report.create({
      declaration: target._id,
      reporter: reporter._id,
      reason,
      description,
    });
  } catch (error) {
    if (error.code === 11000) throw new Errors.ReportAlreadyExistsError();
    throw error;
  }

  await maybeAutoHide(target._id);

  return report;
};

const listMine = async (reporterId, { page, limit }) => {
  const filter = { reporter: reporterId };

  const [items, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit)
      .select("-handledBy")
      .lean(),
    Report.countDocuments(filter),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
};

// --------------------------------------------------------------- admin side
const DECLARATION_PREVIEW = "title type category status isHidden owner";
const REPORTER_PREVIEW = "firstName lastName email";

const list = async ({ page, limit, status, reason, declaration, sort }) => {
  const filter = {};
  if (status) filter.status = status;
  if (reason) filter.reason = reason;
  if (declaration) filter.declaration = declaration;

  const [items, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: sort === "oldest" ? 1 : -1 })
      .skip(getSkip(page, limit))
      .limit(limit)
      .populate("declaration", DECLARATION_PREVIEW)
      .populate("reporter", REPORTER_PREVIEW)
      .lean(),
    Report.countDocuments(filter),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
};

const getById = async (id) => {
  const report = await Report.findById(id)
    .populate("declaration", DECLARATION_PREVIEW)
    .populate("reporter", REPORTER_PREVIEW)
    .populate("handledBy", "firstName lastName")
    .lean();

  if (!report) throw new Errors.NotFoundError("Report", id);

  // Context for the moderator: other reports on the same declaration
  const declarationId = report.declaration?._id ?? report.declaration;
  const relatedReports = await Report.countDocuments({
    declaration: declarationId,
    _id: { $ne: report._id },
  });

  return { ...report, relatedReports };
};

/**
 * Process a report: in_review | resolved | dismissed.
 * "resolved" may carry an action on the declaration (hide / delete).
 */
const process = async (id, actor, { status, resolutionNote, action }) => {
  const report = await Report.findById(id);
  if (!report) throw new Errors.NotFoundError("Report", id);

  if (!REPORT_PENDING_STATUSES.includes(report.status)) {
    throw new Errors.ReportAlreadyClosedError(report.status);
  }

  if (status !== REPORT_STATUS.RESOLVED && action !== REPORT_ACTION.NONE) {
    throw new Errors.BadRequestError(
      { field: "action" },
      "An action on the declaration is only allowed when resolving a report.",
    );
  }

  if (
    status !== REPORT_STATUS.IN_REVIEW &&
    !resolutionNote
  ) {
    throw new Errors.ValidationError({
      resolutionNote: [{ code: "FIELD_REQUIRED", params: {} }],
    });
  }

  if (
    action === REPORT_ACTION.DELETE_DECLARATION &&
    actor.role !== ROLES.ADMIN
  ) {
    throw new Errors.InsufficientRoleError();
  }

  // 1) Apply the action on the declaration first (so a failure leaves the report open)
  if (action === REPORT_ACTION.HIDE_DECLARATION) {
    await moderationService.hide(report.declaration, actor, resolutionNote);
  } else if (action === REPORT_ACTION.DELETE_DECLARATION) {
    await moderationService.remove(report.declaration, actor, resolutionNote);
  }

  // 2) Update the report
  report.status = status;
  report.handledBy = actor._id;
  if (status !== REPORT_STATUS.IN_REVIEW) {
    report.handledAt = new Date();
    report.resolutionNote = resolutionNote;
    report.actionTaken = action;
  }
  await report.save();

  // 3) Audit
  await auditService.log({
    actor,
    action:
      status === REPORT_STATUS.RESOLVED
        ? MODERATION_ACTION.REPORT_RESOLVE
        : status === REPORT_STATUS.DISMISSED
          ? MODERATION_ACTION.REPORT_DISMISS
          : MODERATION_ACTION.REPORT_REVIEW,
    targetType: TARGET_TYPE.REPORT,
    targetId: report._id,
    reason: resolutionNote,
    metadata: { declaration: report.declaration, actionTaken: action },
  });

  // 4) Notify reporter(s) when closed
  if (status !== REPORT_STATUS.IN_REVIEW) {
    await notifyService.notify(
      report.reporter,
      NOTIFICATION_TYPE.REPORT_PROCESSED,
      {
        message: "Your report has been processed.",
        report: report._id,
        outcome: status,
      },
    );

    // 5) If an action was taken, close sibling reports on the same declaration
    if (action !== REPORT_ACTION.NONE) {
      await closeSiblings(report, actor, action);
    }
  }

  return report;
};

const closeSiblings = async (report, actor, action) => {
  const siblings = await Report.find({
    declaration: report.declaration,
    _id: { $ne: report._id },
    status: { $in: REPORT_PENDING_STATUSES },
  });

  for (const sibling of siblings) {
    sibling.status = REPORT_STATUS.RESOLVED;
    sibling.handledBy = actor._id;
    sibling.handledAt = new Date();
    sibling.actionTaken = action;
    sibling.resolutionNote = `Resolved together with report ${report._id}.`;
    await sibling.save();

    await notifyService.notify(
      sibling.reporter,
      NOTIFICATION_TYPE.REPORT_PROCESSED,
      {
        message: "Your report has been processed.",
        report: sibling._id,
        outcome: REPORT_STATUS.RESOLVED,
      },
    );
  }
};

export default { create, listMine, list, getById, process };
