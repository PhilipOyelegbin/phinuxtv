require("dotenv").config();
const { dataSource } = require("./src/data-source.js");
const { createApp } = require("./src/app.js");
const { connectRedis } = require("./src/cache/redis.js");

const app = createApp(dataSource);
const port = process.env.PORT || 4000;

async function bootstrap() {
  await dataSource.initialize();
  await connectRedis();

  app.listen(port, () => {
    console.log(`PhinuxTV API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) =>
  console.error("Error starting the server:", error),
);
