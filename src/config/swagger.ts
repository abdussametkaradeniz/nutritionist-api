import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Diyetisyen API",
    version: "1.0.0",
    description: "Diyetisyen uygulaması API dokümantasyonu",
  },
  servers: [
    {
      url: "/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts"], // routes dosyalarının yolu
};

export const swaggerConfig = swaggerJsdoc(options);
