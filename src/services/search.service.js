/**
 * search.service.js
 *
 * Core search logic:
 * - find + sort + skip/limit + count + suggestions + synonym expansion
 * - autocomplete across posts, categories and places
 * - itinerary / timeline search ("dernière position plausible")
 */

import mongoose from "mongoose";
import Post from "../models/post.js";
import Category from "../models/category.js";
import Place from "../models/place.js";
import { buildSearchQuery, escapeRegex } from "../utils/buildSearchQuery.js";
import { paginationParams, paginationMeta } from "../utils/pagination.js";
import { haversineKm } from "../utils/geo.js";
import { expandQueryWithSynonyms, getSynonymsForTerm } from "../utils/synonyms.js";

/**
 * Search declarations with combined criteria, pagination, and synonyms.
 *
 * @param {object} params  Validated & sanitised query parameters
 * @returns {Promise<{ data: object[], pagination: object, suggestions: string[], synonymsAdded?: string[] }>}
 */
export const searchPosts = async (params) => {
    const { query, projection, needsTextScore, synonymsAdded } = await buildSearchQuery(params);
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

    const response = { data, pagination, suggestions };

    if (synonymsAdded && synonymsAdded.length > 0) {
        response.synonymsAdded = synonymsAdded;
    }

    return response;
};

/**
 * Autocomplete suggestions for real-time search typing.
 * Searches across active posts titles, categories and places.
 * Also tolerates synonyms to suggest relevant entries.
 *
 * @param {{ q: string, limit?: number, intent?: string }} params
 * @returns {Promise<{ query: string, suggestions: { posts: object[], categories: object[], places: object[] } }>}
 */
export const autocompletePosts = async ({ q, limit = 5, intent }) => {
    const cleanQ = q.trim();
    const syns = getSynonymsForTerm(cleanQ);
    const terms = [cleanQ, ...syns].slice(0, 4);

    const regexArray = terms.map((t) => new RegExp(escapeRegex(t), "i"));
    const postFilter = {
        $or: regexArray.map((r) => ({ title: r })),
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
        Category.find({
            $or: regexArray.map((r) => ({ name: r })),
            isActive: { $ne: false }
        })
            .select("_id name")
            .limit(limit)
            .lean(),
        Place.find({
            $or: [
                ...regexArray.map((r) => ({ name: r })),
                ...regexArray.map((r) => ({ zone: r }))
            ],
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

/**
 * Recherche par « Dernière position plausible » (Itinéraire temporel).
 * L'utilisateur fournit les étapes de sa journée (lieu + heure de passage).
 * Retourne les objets trouvés à l'un de ces endroits APRÈS l'heure où il y était.
 *
 * @param {{ steps: Array<{ place: string, time: string|Date }>, category?: string, q?: string, color?: string, brand?: string, limit?: number }} payload
 * @returns {Promise<{ trajectory: object[], total: number, data: object[], synonymsUsed: string[] }>}
 */
export const searchByItinerary = async (payload) => {
    const { steps, category, q, color, brand, limit = 20 } = payload;

    const placeConditions = [];
    const resolvedSteps = [];

    for (const step of steps) {
        const isId = mongoose.Types.ObjectId.isValid(step.place);
        const placeQuery = isId
            ? { $or: [{ _id: step.place }, { name: new RegExp(escapeRegex(step.place), "i") }] }
            : {
                  $or: [
                      { name: new RegExp(escapeRegex(step.place), "i") },
                      { zone: new RegExp(escapeRegex(step.place), "i") }
                  ]
              };

        const matchingPlaces = await Place.find(placeQuery).select("_id name zone").lean();
        if (matchingPlaces.length > 0) {
            const placeIds = matchingPlaces.map((p) => p._id);
            const stepDate = new Date(step.time);
            resolvedSteps.push({
                placeInput: step.place,
                userTime: stepDate,
                places: matchingPlaces,
                placeIds
            });

            // Trouvé à cet endroit à partir ou après l'heure de passage
            placeConditions.push({
                place: { $in: placeIds },
                $or: [
                    { start: { $gte: stepDate } },
                    { end: { $gte: stepDate } },
                    { createdAt: { $gte: stepDate } }
                ]
            });
        }
    }

    // Aucun lieu n'a pu être résolu
    if (placeConditions.length === 0) {
        return {
            trajectory: steps,
            total: 0,
            synonymsUsed: [],
            data: [],
            suggestions: [
                "Aucun lieu de votre itinéraire n'a été reconnu. Vérifiez le nom des lieux ou zones (ex: 'Food court', 'Accueil', 'Parking')."
            ]
        };
    }

    const query = {
        intent: "found",
        status: "active",
        isHidden: { $ne: true },
        $or: placeConditions
    };

    // Filtre optionnel de catégorie
    if (category) {
        const isId = mongoose.Types.ObjectId.isValid(category);
        const catQuery = isId
            ? { $or: [{ _id: category }, { name: new RegExp(`^${escapeRegex(category)}$`, "i") }] }
            : { name: new RegExp(`^${escapeRegex(category)}$`, "i") };
        const matchedCats = await Category.find(catQuery).select("_id").lean();
        if (matchedCats.length > 0) {
            query.category = { $in: matchedCats.map((c) => c._id) };
        } else {
            query.category = new mongoose.Types.ObjectId();
        }
    }

    // Filtre plein-texte optionnel avec expansion de synonymes
    let projection = {};
    let synonymsUsed = [];
    if (q && q.trim()) {
        const expansion = expandQueryWithSynonyms(q.trim());
        query.$text = { $search: expansion.expanded };
        projection = { score: { $meta: "textScore" } };
        synonymsUsed = expansion.synonymsAdded;
    }

    // Filtres optionnels par couleur et marque
    if (color) {
        query.color = new RegExp(`^${escapeRegex(color)}$`, "i");
    }
    if (brand) {
        query.brand = new RegExp(`^${escapeRegex(brand)}$`, "i");
    }

    const sortObj = projection.score
        ? { score: { $meta: "textScore" }, start: -1 }
        : { start: -1, createdAt: -1 };

    const [docs, total] = await Promise.all([
        Post.find(query, projection)
            .populate("category", "name description")
            .populate("place", "name zone lat lng")
            .sort(sortObj)
            .limit(limit)
            .lean(),
        Post.countDocuments(query)
    ]);

    // Annoter chaque résultat avec l'étape de l'itinéraire qui a déclenché la correspondance
    const data = docs.map((doc) => {
        const stepMatch = resolvedSteps.find((s) =>
            s.placeIds.some((pid) => pid.toString() === doc.place?._id?.toString())
        );
        return {
            ...doc,
            timelineMatch: stepMatch
                ? {
                      visitedPlace: stepMatch.placeInput,
                      userPassageTime: stepMatch.userTime,
                      foundAtLocation: doc.place?.name,
                      zone: doc.place?.zone
                  }
                : null
        };
    });

    return {
        trajectory: steps,
        total,
        synonymsUsed,
        data
    };
};

// ── Suggestion helpers ──────────────────────────────────────────

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

export default { searchPosts, autocompletePosts, searchByItinerary };
