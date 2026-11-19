import Joi from "joi";
import { REPORT_REASON } from "../constants/report.js";

const objectId = Joi.string().hex().length(24);

const createReportSchema = Joi.object({
  declaration: objectId.required(),
  reason: Joi.string()
    .valid(...Object.values(REPORT_REASON))
    .required(),
  description: Joi.string().trim().allow("").max(500).default(""),
}).unknown(false);

const listMyReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
}).unknown(false);

export default { createReportSchema, listMyReportsSchema };
