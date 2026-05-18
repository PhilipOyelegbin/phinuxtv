require("dotenv").config();

const { dataSource } = require("./data-source");
const { createApp } = require("./app.js");
const { connectRedis } = require("./cache/redis");

async function bootstrap() {
  await dataSource.initialize();
  await connectRedis();

  const app = createApp(dataSource);
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`PhinuxTV API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start PhinuxTV API:", error);
  process.exit(1);
});
