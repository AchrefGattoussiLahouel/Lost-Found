/**
 * pagination.js — Compute skip, sort, and build the pagination envelope.
 */

/**
 * @param {{ page: number, limit: number, sort: string }} opts
 * @returns {{ skip: number, limit: number, sortObj: object }}
 */
export const paginationParams = ({ page, limit, sort }) => {
    const skip = (page - 1) * limit;

    const SORT_MAP = {
        recent: { created_at: -1 },
        oldest: { created_at: 1 },
        relevance: { score: { $meta: "textScore" }, created_at: -1 }
    };

    return {
        skip,
        limit,
        sortObj: SORT_MAP[sort] || SORT_MAP.recent
    };
};

/**
 * Build the pagination metadata block.
 *
 * @param {{ total: number, page: number, limit: number }} p
 * @returns {{ page, limit, total, totalPages, hasNextPage, hasPrevPage }}
 */
export const paginationMeta = ({ total, page, limit }) => {
    const totalPages = Math.ceil(total / limit) || 1;

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

