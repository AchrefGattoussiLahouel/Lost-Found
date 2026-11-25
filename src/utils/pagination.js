export const getSkip = (page, limit) => (page - 1) * limit;
/**
 * pagination.js — Compute skip, sort, and build the pagination envelope.
 */

/**
 * @param {{ page: number, limit: number, sort: string }} opts
 * @returns {{ skip: number, limit: number, sortObj: object }}
 */
export const paginationParams = ({ page, limit, sort }) => {
  const skip = getSkip(page, limit);

  const SORT_MAP = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    relevance: { score: { $meta: "textScore" }, createdAt: -1 },
  };

  return {
    skip,
    limit,
    sortObj: SORT_MAP[sort] || SORT_MAP.recent,
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
    hasPrevPage: page > 1,
  };
};
