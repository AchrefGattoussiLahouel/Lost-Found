import Joi from "joi";
import { REPORT_REASON, REPORT_STATUS } from "../constants/report.js";

const objectId = Joi.string().hex().length(24);

const createReportSchema = Joi.object({
  post: objectId.required(),

  reason: Joi.string()
    .valid(...Object.values(REPORT_REASON))
    .required(),

  description: Joi.string().trim().allow("").max(500).default(""),
}).unknown(false);

const listMyReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

const listReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(20),

  status: Joi.string()
    .valid(...Object.values(REPORT_STATUS))
    .optional(),

  reason: Joi.string()
    .valid(...Object.values(REPORT_REASON))
    .optional(),

  post: objectId.optional(),

  sort: Joi.string().valid("newest", "oldest").default("newest"),
}).unknown(false);

const getReportByIdSchema = Joi.object({
  id: objectId.required(),
}).unknown(false);

const processReportSchema = Joi.object({
  status: Joi.string()
    .valid(
      REPORT_STATUS.IN_REVIEW,
      REPORT_STATUS.RESOLVED,
      REPORT_STATUS.DISMISSED,
    )
    .required(),

  resolutionNote: Joi.string()
    .trim()
    .max(1000)
    .when("status", {
      is: Joi.valid(REPORT_STATUS.RESOLVED, REPORT_STATUS.DISMISSED),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
}).unknown(false);

export default {
  createReportSchema,
  listMyReportsSchema,
  listReportsSchema,
  getReportByIdSchema,
  processReportSchema,
};
