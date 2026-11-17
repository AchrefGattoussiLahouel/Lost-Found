import amqp from "amqplib";

let connection;
let confirmChannel;
let connectionPromise;

export async function connectRabbitMQ() {
  if (confirmChannel) return confirmChannel;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error("Missing RABBITMQ_URL environment variable");

    connection = await amqp.connect(url);

    connection.on("error", (error) => {
      console.error("[RabbitMQ] connection error:", error.message);
    });

    connection.on("close", () => {
      console.error("[RabbitMQ] connection closed");
      connection = undefined;
      confirmChannel = undefined;
    });

    confirmChannel = await connection.createConfirmChannel();
    confirmChannel.on("error", (error) => {
      console.error("[RabbitMQ] channel error:", error.message);
    });
    confirmChannel.on("close", () => {
      console.warn("[RabbitMQ] channel closed");
      confirmChannel = undefined;
    });

    console.info("[RabbitMQ] connected");
    return confirmChannel;
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }
}

export function getRabbitMQChannel() {
  if (!confirmChannel) {
    throw new Error("RabbitMQ is not connected. Call connectRabbitMQ() first.");
  }
  return confirmChannel;
}

export async function closeRabbitMQ() {
  const channelToClose = confirmChannel;
  const connectionToClose = connection;
  confirmChannel = undefined;
  connection = undefined;

  if (channelToClose) {
    try { await channelToClose.close(); } catch {}
  }
  if (connectionToClose) {
    try { await connectionToClose.close(); } catch {}
  }
}
