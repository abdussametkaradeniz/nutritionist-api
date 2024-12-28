import dotenv from "dotenv";

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: "1h",
  },
  cors: {
    allowedMethods: process.env.ALLOWED_METHODS?.split(",") || [],
    allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
    allowedHeaders: process.env.ALLOWED_HEADERS?.split(",") || [],
  },
};
