import Report from "../models/report.js";
import postSchema from "../models/post.js";
import Errors from "../errors/index.js";

import { REPORT_STATUS, REPORT_PENDING_STATUSES } from "../constants/report.js";
import { getSkip, paginationMeta } from "../utils/pagination.js";

const create = async (reporter, { post, reason, description }) => {
  const target = await postSchema.findById(post);
  if (!target) {
    throw new Errors.PostNotFoundError();
  }
  if (String(target.user) === String(reporter._id)) {
    throw new Errors.CannotReportOwnPostError();
  }

  try {
    const report = await Report.create({
      post: target._id,
      reporter: reporter._id,
      reason,
      description,
    });

    return report;
  } catch (error) {
    // Prevent duplicate reports
    if (error.code === 11000) {
      throw new Errors.ReportAlreadyExistsError();
    }

    throw error;
  }
};

const listMine = async (reporterId, { page, limit }) => {
  const filter = {
    reporter: reporterId,
  };

  const [items, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit)
      .select("-handledBy")
      .lean(),

    Report.countDocuments(filter),
  ]);

  return {
    items,
    meta: paginationMeta({ page, limit, total }),
  };
};

const POST_PREVIEW = "title type category status isHidden owner";
const REPORTER_PREVIEW = "firstName lastName email";

const list = async ({ page, limit, status, reason, post, sort }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (reason) {
    filter.reason = reason;
  }

  if (post) {
    filter.post = post;
  }

  const [items, total] = await Promise.all([
    Report.find(filter)
      .sort({
        createdAt: sort === "oldest" ? 1 : -1,
      })
      .skip(getSkip(page, limit))
      .limit(limit)
      .populate("post", POST_PREVIEW)
      .populate("reporter", REPORTER_PREVIEW)
      .lean(),

    Report.countDocuments(filter),
  ]);

  return {
    items,
    meta: paginationMeta({ page, limit, total }),
  };
};

const getById = async (id) => {
  const report = await Report.findById(id)
    .populate("post", POST_PREVIEW)
    .populate("reporter", REPORTER_PREVIEW)
    .populate("handledBy", "firstName lastName")
    .lean();

  if (!report) {
    throw new Errors.ReportNotFoundError();
  }

  return {
    ...report,
  };
};

const process = async (id, actor, { status, resolutionNote }) => {
  const report = await Report.findById(id);

  if (!report) {
    throw new Errors.ReportNotFoundError();
  }

  if (!REPORT_PENDING_STATUSES.includes(report.status)) {
    throw new Errors.ReportAlreadyClosedError(report.status);
  }

  const allowedStatuses = [
    REPORT_STATUS.IN_REVIEW,
    REPORT_STATUS.RESOLVED,
    REPORT_STATUS.DISMISSED,
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Errors.ReportStatusInvalidError();
  }

  // Require a resolution note when closing the report
  if (status !== REPORT_STATUS.IN_REVIEW && !resolutionNote) {
    throw new Errors.ValidationError({
      resolutionNote: [
        {
          code: "FIELD_REQUIRED",
          params: {},
        },
      ],
    });
  }

  report.status = status;
  report.handledBy = actor._id;

  // Record resolution information when the report is closed
  if (status !== REPORT_STATUS.IN_REVIEW) {
    report.handledAt = new Date();
    report.resolutionNote = resolutionNote;
  }

  await report.save();

  return report;
};

export default {
  create,
  listMine,
  list,
  getById,
  process,
};
