/**
 * search.controller.js
 *
 * Thin layer: req → service → res
 *
 * Access rules:
 *  - staff / admin  → can search all intents (lost + found)
 *  - regular member → forced to intent=found only (cannot see lost declarations)
 *  - guest (no token) → forced to intent=found only
 */

import { searchPosts, autocompletePosts, searchByItinerary } from "../services/search.service.js";
import { isStaff } from "../rules/post.rules.js";

/** Returns true if the current actor has full search access */
const hasFullAccess = (user) => user && isStaff(user);

export const search = async (req, res, next) => {
    try {
        const params = { ...req.validated.query };

        // Non-staff: force intent=found regardless of what was passed
        if (!hasFullAccess(req.user)) {
            params.intent = "found";
        }

        const result = await searchPosts(params);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const autocomplete = async (req, res, next) => {
    try {
        const params = { ...req.validated.query };

        // Non-staff: force intent=found in autocomplete too
        if (!hasFullAccess(req.user)) {
            params.intent = "found";
        }

        const result = await autocompletePosts(params);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export const searchItinerary = async (req, res, next) => {
    try {
        const body = { ...req.validated.body };

        // Non-staff: itinerary only searches found posts
        if (!hasFullAccess(req.user)) {
            body.intent = "found";
        }

        const result = await searchByItinerary(body);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export default { search, autocomplete, searchItinerary };

