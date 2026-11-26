/**
 * buildSearchQuery.js
 *
 * Turns validated search params into a Mongo filter object.
 * Resolves references (Category, Place) and keeps the service layer clean.
 */

import mongoose from "mongoose";
import Category from "../models/category.js";
import Place from "../models/place.js";
import { boundingBox } from "./geo.js";

/**
 * @param {object} filters  Validated query params
 * @returns {Promise<{ query: object, projection: object, needsTextScore: boolean }>}
 */
export const buildSearchQuery = async (filters) => {
    const {
        q,
        intent,
        category,
        zone,
        place,
        lat,
        lng,
        radius,
        from,
        to,
        status = "active"
    } = filters;

    const query = {};

    // ── Status (default: active) & Exclude hidden / moderated posts ──
    query.status = status;
    query.isHidden = { $ne: true };

    // ── Intent ──────────────────────────────────────────────────
    if (intent) {
        query.intent = intent;
    }

    // ── Category (resolve ObjectId from Category collection) ───
    if (category) {
        const isId = mongoose.Types.ObjectId.isValid(category);
        const categoryQuery = isId
            ? { $or: [{ _id: category }, { name: new RegExp(`^${escapeRegex(category)}$`, "i") }] }
            : { name: new RegExp(`^${escapeRegex(category)}$`, "i") };

        const matchingCategories = await Category.find(categoryQuery).select("_id").lean();
        if (matchingCategories.length > 0) {
            query.category = { $in: matchingCategories.map((c) => c._id) };
        } else {
            // No matching category found -> force 0 matches
            query.category = new mongoose.Types.ObjectId();
        }
    }

    // ── Place / Zone / Coordinates (resolve from Place collection)
    const placeConditions = [];

    if (zone) {
        placeConditions.push({ zone: new RegExp(escapeRegex(zone), "i") });
    }

    if (place) {
        const isId = mongoose.Types.ObjectId.isValid(place);
        placeConditions.push(
            isId
                ? { $or: [{ _id: place }, { name: new RegExp(escapeRegex(place), "i") }] }
                : { name: new RegExp(escapeRegex(place), "i") }
        );
    }

    if (lat != null && lng != null) {
        const box = boundingBox(lat, lng, radius || 5);
        placeConditions.push({
            lat: { $gte: box.minLat, $lte: box.maxLat },
            lng: { $gte: box.minLng, $lte: box.maxLng }
        });
    }

    if (placeConditions.length > 0) {
        const placeFilter =
            placeConditions.length === 1 ? placeConditions[0] : { $and: placeConditions };
        const matchingPlaces = await Place.find(placeFilter).select("_id").lean();

        if (matchingPlaces.length > 0) {
            query.place = { $in: matchingPlaces.map((p) => p._id) };
        } else {
            // No matching place found -> force 0 matches
            query.place = new mongoose.Types.ObjectId();
        }
    }

    // ── Full-text search ────────────────────────────────────────
    let needsTextScore = false;

    if (q && q.trim()) {
        query.$text = { $search: q.trim() };
        needsTextScore = true;
    }

    // ── Date range (overlap search) ─────────────────────────────
    //   The post's window [start, end] overlaps the query [from, to]
    //   when: post.start <= to  AND  post.end >= from
    if (from) {
        query.end = query.end || {};
        query.end.$gte = new Date(from);
    }

    if (to) {
        query.start = query.start || {};
        query.start.$lte = new Date(to);
    }

    // ── Projection ─────────────────────────────────────────────
    const projection = needsTextScore
        ? { score: { $meta: "textScore" } }
        : {};

    return { query, projection, needsTextScore };
};

// Escape special regex chars so user input is safe
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default buildSearchQuery;
