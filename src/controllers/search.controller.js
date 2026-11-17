/**
 * search.controller.js
 *
 * Thin layer: req → service → res
 */

import { searchPosts } from "../services/search.service.js";

export const search = async (req, res, next) => {
    try {
        const result = await searchPosts(req.validated.query);

        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

export default { search };

