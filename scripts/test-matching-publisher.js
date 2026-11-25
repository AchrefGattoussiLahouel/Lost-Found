import "dotenv/config";
import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "../src/queue/rabbitmq.connection.js";
import { publishPostCreated } from "../src/queue/matching.publisher.js";

try {
  await connectRabbitMQ();
  const fakePost = {
    _id: `rabbitmq-test-${Date.now()}`,
    intent: process.argv[2] ?? "LOST",
  };
  const event = await publishPostCreated(fakePost);
  console.log("[TEST] published:", JSON.stringify(event, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await closeRabbitMQ();
}
