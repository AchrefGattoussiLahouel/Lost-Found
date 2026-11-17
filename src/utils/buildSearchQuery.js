/**
 * buildSearchQuery.js
 *
 * Turns validated search params into a Mongo filter object.
 * Keeps the service layer clean from query-building logic.
 */

import { boundingBox } from "./geo.js";

/**
 * @param {object} filters  Validated query params
 * @returns {{ query: object, projection: object, needsTextScore: boolean }}
 */
export const buildSearchQuery = (filters) => {
    const {
        q,
        intent,
        category,
        lat,
        lng,
        radius,
        from,
        to,
        status = "active"
    } = filters;

    const query = {};

    // ── Status (default: only ACTIVE posts are searchable) ──────
    query.status = status;

    // ── Intent ──────────────────────────────────────────────────
    if (intent) {
        query.intent = intent;
    }

    // ── Category ────────────────────────────────────────────────
    if (category) {
        query.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    }

    // ── Full-text search ────────────────────────────────────────
    let needsTextScore = false;

    if (q) {
        query.$text = { $search: q };
        needsTextScore = true;
    }

    // ── Date range (overlap search) ─────────────────────────────
    //   The post's window [start, end] overlaps the query [from, to]
    //   when: post.start <= to  AND  post.end >= from
    if (from) {
        query.start = query.start || {};
        query.start.$lte = to || new Date();
    }

    if (from) {
        query.end = query.end || {};
        query.end.$gte = new Date(from);
    }

    // ── Geo bounding box ────────────────────────────────────────
    if (lat != null && lng != null) {
        const box = boundingBox(lat, lng, radius || 5);

        query.lat = { $gte: box.minLat, $lte: box.maxLat };
        query.lng = { $gte: box.minLng, $lte: box.maxLng };
    }

    // ── Projection: NEVER expose secret_detail ──────────────────
    const projection = { secret_detail: 0 };

    if (needsTextScore) {
        projection.score = { $meta: "textScore" };
    }

    return { query, projection, needsTextScore };
};

// Escape special regex chars so user input is safe
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default buildSearchQuery;
