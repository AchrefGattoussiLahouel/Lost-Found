import { getRabbitMQChannel } from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.connection.js";
import {
  MATCHING_EXCHANGE, MATCHING_ROUTING_KEY, MATCHING_QUEUE,
  MATCHING_RETRY_QUEUE, MATCHING_DLQ, MATCHING_RETRY_DELAY_MS
} from "../../../../infrastructure/messaging/rabbitmq/rabbitmq.constants.js";

export async function declareMatchingTopology() {
  const channel = getRabbitMQChannel();

  await channel.assertExchange(MATCHING_EXCHANGE, "direct", { durable: true });

  await channel.assertQueue(MATCHING_QUEUE, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": MATCHING_EXCHANGE,
      "x-dead-letter-routing-key": MATCHING_ROUTING_KEY
    }
  });

  await channel.assertQueue(MATCHING_RETRY_QUEUE, {
    durable: true,
    arguments: {
      "x-message-ttl": MATCHING_RETRY_DELAY_MS,
      "x-dead-letter-exchange": MATCHING_EXCHANGE,
      "x-dead-letter-routing-key": MATCHING_ROUTING_KEY
    }
  });

  await channel.assertQueue(MATCHING_DLQ, { durable: true });
  await channel.bindQueue(MATCHING_QUEUE, MATCHING_EXCHANGE, MATCHING_ROUTING_KEY);

  return {
    exchange: MATCHING_EXCHANGE,
    queue: MATCHING_QUEUE,
    retryQueue: MATCHING_RETRY_QUEUE,
    deadLetterQueue: MATCHING_DLQ
  };
}
