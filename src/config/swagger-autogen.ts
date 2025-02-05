import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Diyetisyen API",
    description: "Diyetisyen uygulaması API dokümantasyonu",
    version: "1.0.0",
  },
  host: "localhost:3000",
  basePath: "/api",
  schemes: ["http", "https"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Bearer token",
    },
  },
  definitions: {
    // Modeller otomatik oluşturulacak
  },
};

const outputFile = "./src/config/swagger-output.json";
const routes = ["./routes.ts"];

swaggerAutogen(outputFile, routes, doc);
