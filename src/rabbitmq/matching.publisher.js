import { getRabbitMQChannel } from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.connection.js";
import {
  MATCHING_EXCHANGE, MATCHING_ROUTING_KEY
} from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.constants.js";
import { createPostCreatedEvent } from "../../domain/events/post-created.event.js";
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
        timestamp: Date.now()
      },
      (error) => error ? reject(error) : resolve()
    );
  });

  return event;
}
