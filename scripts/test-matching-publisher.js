import "dotenv/config";
import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "../src/rabbitmq/rabbitmq.connection.js";
import { publishPostCreated } from "../src/rabbitmq/matching.publisher.js";

try {
  await connectRabbitMQ();
  const fakePost = {
    _id: `rabbitmq-test-${Date.now()}`,
    intent: process.argv[2] ?? "FOUND",
  };
  const event = await publishPostCreated(fakePost);
  console.log("[TEST] published:", JSON.stringify(event, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await closeRabbitMQ();
}
