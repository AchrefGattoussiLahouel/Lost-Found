export const getSkip = (page, limit) => (page - 1) * limit;
export function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}
