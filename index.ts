import express from "express";
import cors from "cors";
import { setRoutes } from "./routes";
import dotenv from "dotenv"; // dotenv paketini dahil edin
import errorMiddleware from "./src/middleware/error";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerConfig } from "./src/config/swagger";

dotenv.config(); // dotenv.config() çağrısını yapın

class App {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: (origin, callback) => {
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeSwagger() {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
  }

  private initializeRoutes() {
    setRoutes(this.app);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

const app = new App();
app.listen();

export default app.app;
