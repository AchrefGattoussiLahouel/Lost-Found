import mongoose from "mongoose";
import { TICKET_STATUS, TICKET_TIER } from "../constants/tickets.js";
const { Schema } = mongoose;

const TicketSchema = new Schema(
  {
    lostId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    foundId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    scores: {
      semantic: Number,
      visual: Number,
      spatial: Number,
      temporal: Number,
      total: Number,
    },
    tier: { type: String, enum: Object.values(TICKET_TIER), required: true },
    reasons: [String],
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.PROPOSED,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

TicketSchema.index({ lostId: 1, foundId: 1 }, { unique: true });
export default mongoose.model("Ticket", TicketSchema);
