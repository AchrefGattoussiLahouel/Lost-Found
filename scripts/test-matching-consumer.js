import "dotenv/config";
import {
  connectRabbitMQ,
  closeRabbitMQ,
} from "../src/queue/rabbitmq.connection.js";
import { startMatchingConsumer } from "../src/queue/matching.consumer.js";

try {
  await connectRabbitMQ();
  await startMatchingConsumer(async (event) => {
    console.log("[TEST HANDLER] received:", JSON.stringify(event, null, 2));
  });
  console.log("[TEST] consumer ready; press Ctrl+C to stop");
} catch (error) {
  console.error(error);
  await closeRabbitMQ();
  process.exit(1);
}

process.on("SIGINT", async () => {
  await closeRabbitMQ();
  process.exit(0);
});
