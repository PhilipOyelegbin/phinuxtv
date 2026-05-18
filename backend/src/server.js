require("dotenv").config();
const { dataSource } = require("./data-source");
const { createApp } = require("./app.js");
const { connectRedis } = require("./cache/redis");

const app = createApp(dataSource);
const port = process.env.PORT || 4000;

app.listen(port, async () => {
  await dataSource.initialize();
  await connectRedis();
  console.log(`PhinuxTV API running on http://localhost:${port}`);
});
