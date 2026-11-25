import postService from "../services/post.service.js";
import { MatchingService } from "../services/matching.service.js";
import { validatePostCreatedEvent } from "./post-created.event.js";

const matchingService = new MatchingService({ posts: postService });

export async function processPostCreated(event) {
  if (!validatePostCreatedEvent(event)) {
    throw new Error("Invalid LOST post event");
  }

  const { postId, intent } = event.payload;
  console.info(`[Matching] processing ${intent} post ${postId}`);

  return matchingService.findMatches(postId);
}
