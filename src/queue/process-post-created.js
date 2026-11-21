import { validatePostCreatedEvent } from "./post-created.event.js";
import { findMatchesForPost } from "./matching.service.js";

export async function processPostCreated(event) {
  if (!validatePostCreatedEvent(event))
    throw new Error("Invalid POST_CREATED event");

  const { postId, intent } = event.payload;
  console.info(`[Matching] processing ${intent} post ${postId}`);

  return findMatchesForPost(postId, intent);
}
