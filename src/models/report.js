import mongoose from "mongoose";
import {
  REPORT_REASON,
  REPORT_STATUS,
  REPORT_ACTION,
} from "../constants/report.js";

const reportSchema = new mongoose.Schema(
  {
    declaration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Declaration",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(REPORT_REASON),
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.OPEN,
      required: true,
    },
    // Processing information
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    handledAt: { type: Date, default: null },
    resolutionNote: { type: String, trim: true, maxlength: 500, default: "" },
    actionTaken: {
      type: String,
      enum: Object.values(REPORT_ACTION),
      default: REPORT_ACTION.NONE,
    },
  },
  { timestamps: true, versionKey: false },
);

// One report per user per declaration (anti-spam)
reportSchema.index({ declaration: 1, reporter: 1 }, { unique: true });
// Admin queue: filter by status, newest first
reportSchema.index({ status: 1, createdAt: -1 });
// Count pending reports of a declaration (auto-hide rule)
reportSchema.index({ declaration: 1, status: 1 });
// "My reports" list
reportSchema.index({ reporter: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
