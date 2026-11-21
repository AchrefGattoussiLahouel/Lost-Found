/**
 * Integration point for Nizar's scoring and matching implementation.
 *
 * Replace this placeholder with the actual database queries, scoring and
 * ticket creation. The implementation must be idempotent: the same LOST/FOUND
 * pair must not create duplicate matching tickets when a message is redelivered.
 */
export async function findMatchesForPost(postId, intent) {
  throw new Error(
    `Matching logic is not integrated yet (postId=${postId}, intent=${intent})`
  );
}
