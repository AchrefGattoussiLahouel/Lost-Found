import "dotenv/config";
import { connectRabbitMQ, closeRabbitMQ } from "../infrastructure/messaging/rabbitmq/rabbitmq.connection.js";
import { startMatchingConsumer } from "../modules/matching/infrastructure/messaging/matching.consumer.js";
import { processPostCreated } from "../modules/matching/application/use-cases/process-post-created.js";

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.info(`[Matching Worker] received ${signal}; shutting down`);
  await closeRabbitMQ();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

try {
  await connectRabbitMQ();
  await startMatchingConsumer(processPostCreated);
  console.info("[Matching Worker] started");
} catch (error) {
  console.error("[Matching Worker] startup failed:", error);
  await closeRabbitMQ();
  process.exit(1);
}
