import { randomUUID } from "node:crypto";

const VALID_INTENTS = new Set(["LOST", "FOUND"]);

export function createPostCreatedEvent(post) {
  if (!post?._id) throw new Error("A persisted post with _id is required");

  const intent = String(post.intent ?? "").toUpperCase();
  if (!VALID_INTENTS.has(intent)) {
    throw new Error('Post intent must be "LOST" or "FOUND"');
  }

  return {
    eventId: randomUUID(),
    eventType: "POST_CREATED",
    version: 1,
    payload: { postId: String(post._id), intent },
    metadata: { occurredAt: new Date().toISOString() }
  };
}

export function validatePostCreatedEvent(event) {
  return Boolean(
    event &&
    event.eventType === "POST_CREATED" &&
    event.version === 1 &&
    event.payload &&
    typeof event.payload.postId === "string" &&
    event.payload.postId.length > 0 &&
    VALID_INTENTS.has(event.payload.intent)
  );
}
