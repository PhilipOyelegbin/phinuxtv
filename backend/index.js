require("dotenv").config();
const { dataSource } = require("./src/data-source.js");
const { createApp } = require("./src/app.js");
const { connectRedis } = require("./src/cache/redis.js");

const app = createApp(dataSource);
const port = process.env.PORT || 4000;

app.listen(port, async () => {
  await dataSource.initialize();
  await connectRedis();
  console.log(`PhinuxTV API running on http://localhost:${port}`);
});
