const { createClient } = require("redis");

let redisClient = null;

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on("error", (error) => {
    console.warn("Redis error:", error.message);
  });

  await redisClient.connect();
  return redisClient;
}

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  return connectRedis();
}

async function getCache(key) {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

async function setCache(key, value, ttlSeconds = 300) {
  const client = await getRedisClient();

  if (!client) {
    return null;
  }

  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  return value;
}

module.exports = {
  connectRedis,
  getCache,
  setCache,
};
