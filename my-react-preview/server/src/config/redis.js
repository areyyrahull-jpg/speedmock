require("dotenv").config(); // MUST be first

const Redis = require("ioredis");

if (!process.env.UPSTASH_REDIS_URL) {
  
}

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

redis.on("connect", () => {
  // Redis connected
});
redis.on("error", (err) => {
  // Redis error
});

module.exports = redis;