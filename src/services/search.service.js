/**
 * search.service.js
 *
 * Core search logic: find + sort + skip/limit + count + suggestions.
 * Keeps the controller thin and the query-building in utils/.
 */

import Post from "../models/post.js";
import Category from "../models/category.js";
import Place from "../models/place.js";
import { buildSearchQuery } from "../utils/buildSearchQuery.js";
import { paginationParams, paginationMeta } from "../utils/pagination.js";
import { haversineKm } from "../utils/geo.js";

/**
 * Search declarations.
 *
 * @param {object} params  Validated & sanitised query parameters
 * @returns {Promise<{ data: object[], pagination: object, suggestions: string[] }>}
 */
export const searchPosts = async (params) => {
    const { query, projection, needsTextScore } = await buildSearchQuery(params);
    const { skip, limit, sortObj } = paginationParams(params);

    // ── Run find + count in parallel ────────────────────────────
    const [docs, total] = await Promise.all([
        Post.find(query, projection)
            .populate("category", "name description")
            .populate("place", "name zone lat lng")
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean(),
        Post.countDocuments(query)
    ]);

    // ── If geo search, attach distance & re-sort by proximity ───
    let data = docs;

    if (params.lat != null && params.lng != null) {
        data = docs
            .map((doc) => ({
                ...doc,
                distance_km:
                    doc.place?.lat != null && doc.place?.lng != null
                        ? haversineKm(params.lat, params.lng, doc.place.lat, doc.place.lng)
                        : null
            }))
            .sort((a, b) => {
                const distA = a.distance_km ?? Infinity;
                const distB = b.distance_km ?? Infinity;
                return distA - distB;
            });
    }

    // ── Build pagination envelope ───────────────────────────────
    const pagination = paginationMeta({ total, page: params.page, limit });

    // ── Suggestions when 0 results ──────────────────────────────
    const suggestions = total === 0
        ? buildSuggestions(params)
        : [];

    return { data, pagination, suggestions };
};

// ── Suggestion helpers ──────────────────────────────────────────

/**
 * When a search returns nothing, suggest relaxed queries the user
 * could try (wider radius, broader date window, drop category…).
 */
function buildSuggestions(params) {
    const tips = [];

    if (params.category) {
        tips.push("Essayez sans filtre de catégorie.");
    }

    if (params.zone || params.place) {
        tips.push("Essayez sans filtre de lieu ou de zone.");
    }

    if (params.from || params.to) {
        tips.push("Élargissez la plage de dates.");
    }

    if (params.lat != null && params.lng != null) {
        const currentRadius = params.radius || 5;
        tips.push(
            `Augmentez le rayon de recherche (actuellement ${currentRadius} km).`
        );
    }

    if (params.q) {
        tips.push("Utilisez des termes plus généraux dans votre recherche.");
    }

    if (tips.length === 0) {
        tips.push("Aucune déclaration ne correspond. Réessayez plus tard.");
    }

    return tips;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Autocomplete suggestions for real-time search typing.
 * Searches across active posts titles, categories and places.
 *
 * @param {{ q: string, limit?: number, intent?: string }} params
 * @returns {Promise<{ query: string, suggestions: { posts: object[], categories: object[], places: object[] } }>}
 */
export const autocompletePosts = async ({ q, limit = 5, intent }) => {
    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, "i");

    const postFilter = {
        title: regex,
        status: "active",
        isHidden: { $ne: true }
    };

    if (intent) {
        postFilter.intent = intent;
    }

    const [posts, categories, places] = await Promise.all([
        Post.find(postFilter)
            .select("_id title intent category place")
            .populate("category", "name")
            .populate("place", "name zone")
            .limit(limit)
            .lean(),
        Category.find({ name: regex, isActive: { $ne: false } })
            .select("_id name")
            .limit(limit)
            .lean(),
        Place.find({
            $or: [{ name: regex }, { zone: regex }],
            isActive: { $ne: false }
        })
            .select("_id name zone")
            .limit(limit)
            .lean()
    ]);

    return {
        query: q,
        suggestions: {
            posts: posts.map((p) => ({
                id: p._id,
                title: p.title,
                intent: p.intent,
                category: p.category?.name || null,
                place: p.place?.name || null
            })),
            categories: categories.map((c) => ({
                id: c._id,
                name: c.name
            })),
            places: places.map((p) => ({
                id: p._id,
                name: p.name,
                zone: p.zone
            }))
        }
    };
};

export default { searchPosts, autocompletePosts };
