import { createClient } from "redis";
import { env } from "~/env";

const redis = createClient({
  password: env.REDIS_PASSWORD,
  socket: {
    host: "redis-12036.c308.sa-east-1-1.ec2.cloud.redislabs.com",
    port: 12036,
  },
});

redis.connect();

redis.on("error", (err) => {
  console.log(err);
  console.log("Redis Client Error");
});

export { redis };
