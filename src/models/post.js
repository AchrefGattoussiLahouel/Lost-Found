import mongoose from "mongoose";
import {
  INTENTS,
  POST_STATUS,
  CLOSE_REASONS,
  CUSTODY_STATE,
  DEPOSIT_REASONS,
} from "../constants/post.js";

const { Schema } = mongoose;
const ref = (name, extra = {}) => ({
  type: Schema.Types.ObjectId,
  ref: name,
  ...extra,
});

const postSchema = new Schema(
  {
    intent: { type: String, enum: Object.values(INTENTS), required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    category: ref("Category", { required: true }),
    photos: { type: [String], default: [] },
    secret_detail: { type: String, default: "", maxlength: 300, select: false },
    color: { type: String, trim: true, maxlength: 20 },
    brand: { type: String, trim: true, maxlength: 50 },

    place: ref("Place", { required: true }),
    placeDetails: { type: String, trim: true, maxlength: 200 },
    start: { type: Date, default: null },
    end: { type: Date, default: null },

    user: ref("User", { default: null }),
    createdBy: ref("User", { required: true }),
    contact: { name: String, phone: String },
    previousPost: ref("Post"),

    status: {
      type: String,
      enum: Object.values(POST_STATUS),
      default: POST_STATUS.ACTIVE,
      required: true,
    },
    closeReason: { type: String, enum: Object.values(CLOSE_REASONS) },
    closedAt: Date,
    expiresAt: Date,

    //its for the match, if the post is matched with another post,
    //this field will contain the id of the ticket that its matching it needs to be added by Nizar and Daly
    activeMatch: { type: Schema.Types.ObjectId, default: null },

    isHidden: { type: Boolean, default: false },
    hiddenBy: ref("User"),
    hiddenAt: Date,

    isDeleted: { type: Boolean, default: false },
    deletedBy: ref("User"),
    deletedAt: Date,

    referenceCode: { type: String, unique: true, sparse: true },

    custody: {
      state: { type: String, enum: Object.values(CUSTODY_STATE) },
      depositDeadline: Date,
      depositRequiredAt: Date,
      depositReason: { type: String, enum: Object.values(DEPOSIT_REASONS) },
      isOverdue: { type: Boolean, default: false },
      depositedAt: Date,
      receivedBy: ref("User"),
      receivedAt: Date,
      storageSpot: { type: String, trim: true, maxlength: 100 },
    },

    restitution: {
      returnedTo: String,
      idChecked: Boolean,
      notes: String,
      handledBy: ref("User"),
      date: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

postSchema.index({
  intent: 1,
  status: 1,
  isHidden: 1,
  category: 1,
  start: -1,
});
postSchema.index({ place: 1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ status: 1, expiresAt: 1 });
postSchema.index({ "custody.state": 1, "custody.depositDeadline": 1 });

export default mongoose.model("Post", postSchema);
