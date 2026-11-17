// ──────────────────────────────────────────────────────────
// Placeholder Post model — will be replaced by Binôme 1.
// Provides the schema that Search & Exploration depends on.
// ──────────────────────────────────────────────────────────

import mongoose from "mongoose";

const POST_INTENTS = Object.freeze({ LOST: "lost", FOUND: "found" });
const POST_STATUSES = Object.freeze({
    ACTIVE: "active",
    RESOLVED: "resolved",
    EXPIRED: "expired"
});

const postSchema = new mongoose.Schema(
    {
        intent: {
            type: String,
            enum: Object.values(POST_INTENTS),
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        start: { type: Date, default: null },
        end: { type: Date, default: null },
        secret_detail: {
            type: String,
            select: false          // never returned by default
        },
        status: {
            type: String,
            enum: Object.values(POST_STATUSES),
            default: POST_STATUSES.ACTIVE,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false
    }
);

// ── Indexes required by Search & Exploration ────────────────────
// Compound index for the most common filtered query path
postSchema.index({ intent: 1, status: 1, category: 1, start: -1 });

// Full-text search on title + description (excludes secret_detail)
postSchema.index({ title: "text", description: "text" });

// Geo bounding-box queries
postSchema.index({ lat: 1, lng: 1 });

// Sort / range on creation date
postSchema.index({ created_at: -1 });

const Post = mongoose.model("Post", postSchema);

export { POST_INTENTS, POST_STATUSES };
export default Post;

