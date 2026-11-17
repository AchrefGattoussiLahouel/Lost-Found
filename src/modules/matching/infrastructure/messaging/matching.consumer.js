import { getRabbitMQChannel } from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.connection.js";
import {
  MATCHING_QUEUE, MATCHING_RETRY_QUEUE, MATCHING_DLQ,
  MATCHING_MAX_RETRIES, MATCHING_PREFETCH
} from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.constants.js";
import { declareMatchingTopology } from "./matching.topology.js";
import { validatePostCreatedEvent } from "../../domain/events/post-created.event.js";

function publishConfirmed(channel, queue, content, properties) {
  return new Promise((resolve, reject) => {
    channel.sendToQueue(
      queue,
      content,
      { persistent: true, ...properties },
      (error) => error ? reject(error) : resolve()
    );
  });
}

export async function startMatchingConsumer(processEvent) {
  if (typeof processEvent !== "function") {
    throw new TypeError("startMatchingConsumer requires a processEvent function");
  }

  await declareMatchingTopology();
  const channel = getRabbitMQChannel();
  await channel.prefetch(MATCHING_PREFETCH);

  console.info(`[Matching Consumer] listening on ${MATCHING_QUEUE}`);

  await channel.consume(MATCHING_QUEUE, async (message) => {
    if (!message) return;

    const body = message.content;
    const headers = message.properties.headers ?? {};
    const retryCount = Number(headers["x-retry-count"] ?? 0);

    try {
      const event = JSON.parse(body.toString("utf8"));
      if (!validatePostCreatedEvent(event)) throw new Error("Invalid event payload");

      await processEvent(event);
      channel.ack(message);
      console.info(`[Matching Consumer] processed ${event.payload.postId}`);
    } catch (error) {
      console.error("[Matching Consumer] failed:", error.message);
      const retry = retryCount < MATCHING_MAX_RETRIES;
      const destination = retry ? MATCHING_RETRY_QUEUE : MATCHING_DLQ;

      try {
        await publishConfirmed(channel, destination, body, {
          contentType: message.properties.contentType ?? "application/json",
          messageId: message.properties.messageId,
          type: message.properties.type,
          headers: {
            ...headers,
            "x-retry-count": retry ? retryCount + 1 : retryCount,
            "x-last-error": error.message,
            "x-failed-at": new Date().toISOString()
          }
        });
        channel.ack(message);
        console.warn(`[Matching Consumer] forwarded to ${destination}`);
      } catch (forwardError) {
        console.error("[Matching Consumer] forwarding failed:", forwardError.message);
        channel.nack(message, false, true);
      }
    }
  }, { noAck: false });
}
