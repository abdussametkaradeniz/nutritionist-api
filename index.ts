import express from "express";
import cors from "cors";
import { setRoutes } from "./routes";
import dotenv from "dotenv"; // dotenv paketini dahil edin
import errorMiddleware from "./src/middleware/error";

dotenv.config(); // dotenv.config() çağrısını yapın

const port: number = 3000;
const app: express.Application = express();

app.use(
  cors({
    origin: function (origin: any, callback: any) {
      if (!origin || origin.indexOf("localhost") !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD", "PATCH"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setRoutes(app);
app.use(errorMiddleware);
app.listen(port, () => console.log(`Listening on port ${port}`));

export default app;
