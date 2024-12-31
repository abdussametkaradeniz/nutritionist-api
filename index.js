"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const dotenv_1 = __importDefault(require("dotenv")); // dotenv paketini dahil edin
const errorMiddleware_1 = __importDefault(require("./src/middleware/errorMiddleware"));
dotenv_1.default.config(); // dotenv.config() çağrısını yapın
const port = 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || origin.indexOf("localhost") !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD", "PATCH"],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, routes_1.setRoutes)(app);
app.use(errorMiddleware_1.default);
app.listen(port, () => console.log(`Listening on port ${port}`));
exports.default = app;
