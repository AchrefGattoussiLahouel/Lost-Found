import { getRabbitMQChannel } from "./rabbitmq.connection.js";
import {
  MATCHING_EXCHANGE,
  MATCHING_ROUTING_KEY,
} from "./rabbitmq.constants.js";

import { createPostCreatedEvent } from "./post-created.event.js";

import { declareMatchingTopology } from "./matching.topology.js";

export async function publishPostCreated(post) {
  const event = createPostCreatedEvent(post);
  await declareMatchingTopology();

  const channel = getRabbitMQChannel();

  await new Promise((resolve, reject) => {
    channel.publish(
      MATCHING_EXCHANGE,
      MATCHING_ROUTING_KEY,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: event.eventId,
        type: event.eventType,
        timestamp: Date.now(),
      },
      (error) => (error ? reject(error) : resolve()),
    );
  });

  return event;
}
