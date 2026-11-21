export const MATCHING_EXCHANGE = "lostfound.matching";
export const MATCHING_ROUTING_KEY = "matching.post.created";

export const MATCHING_QUEUE = "lostfound.matching.posts";
export const MATCHING_RETRY_QUEUE = "lostfound.matching.posts.retry";
export const MATCHING_DLQ = "lostfound.matching.posts.dlq";

export const MATCHING_MAX_RETRIES = Number(process.env.MATCHING_MAX_RETRIES ?? 3);
export const MATCHING_RETRY_DELAY_MS = Number(process.env.MATCHING_RETRY_DELAY_MS ?? 10000);
export const MATCHING_PREFETCH = Number(process.env.MATCHING_PREFETCH ?? 1);
