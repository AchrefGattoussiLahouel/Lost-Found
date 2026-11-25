import { randomUUID } from "node:crypto";

const LOST_INTENT = "LOST";

export function createPostCreatedEvent(post) {
  if (!post?._id) throw new Error("A persisted post with _id is required");

  const intent = String(post.intent ?? "").toUpperCase();
  if (intent !== LOST_INTENT) {
    throw new Error("Only LOST posts may create matching events");
  }

  return {
    eventId: randomUUID(),
    eventType: "POST_CREATED",
    version: 1,
    payload: { postId: String(post._id), intent },
    metadata: { occurredAt: new Date().toISOString() },
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
    event.payload.intent === LOST_INTENT,
  );
}
