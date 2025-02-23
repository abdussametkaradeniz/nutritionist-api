import { createClient } from "@redis/client";

// Redis bağlantı nesnesini oluştur
export const redis = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
  socket: {
    connectTimeout: 100000, // 10 saniye olarak zaman aşımı ayarı
  },
});

// Redis'e bağlan
redis
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch(console.error);
