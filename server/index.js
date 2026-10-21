import { createApp } from "./app.js";
import { assertRuntimeConfig, config } from "./config.js";
import { connectDatabase } from "./db.js";

try {
  assertRuntimeConfig();
  await connectDatabase();
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    console.log(`Shree Jewellers API listening on port ${config.PORT}.`);
  });

  const shutdown = async () => {
    server.close();
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error(error instanceof Error && error.message.startsWith("Server cannot start.")
    ? error.message
    : "API startup failed. Check the backend environment and Atlas network access.");
  process.exitCode = 1;
}
