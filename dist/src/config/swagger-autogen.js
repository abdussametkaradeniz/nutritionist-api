"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
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
(0, swagger_autogen_1.default)(outputFile, routes, doc);
