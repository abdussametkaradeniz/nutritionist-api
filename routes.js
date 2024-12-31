"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = void 0;
const express_1 = __importDefault(require("express"));
const loggerdeneme_1 = __importDefault(require("./src/logger/loggerdeneme"));
const morgan = require("morgan");
const helmet = require("helmet");
const register_1 = __importDefault(require("./src/routes/auth/register"));
const login_1 = __importDefault(require("./src/routes/auth/login"));
const permissions_1 = __importDefault(require("./src/routes/rolePermissions/permissions"));
const appointment_1 = __importDefault(require("./src/routes/appointments/appointment"));
const logout_1 = __importDefault(require("./src/routes/auth/logout"));
const userProcess_1 = __importDefault(require("./src/routes/users/userProcess"));
const setRoutes = (app) => {
    app.use(express_1.default.json()); //req.body
    app.use(express_1.default.urlencoded({ extended: true })); //key value olarak parse eder
    app.use(loggerdeneme_1.default);
    if (app.get("env") === "development") {
        app.use(morgan("combined")); //console icerisinde nereye istek gittigini soyler
    }
    app.use(express_1.default.static("public")); //public klasoru altindaki her seye erisim saglar link ile ornegin localhost:3000/readme.txt
    app.use(helmet());
    app.use("/api/register", register_1.default);
    app.use("/api/login", login_1.default);
    app.use("/api/role-permission", permissions_1.default);
    app.use("/api/appointments", appointment_1.default);
    app.use("/api/user-process", userProcess_1.default);
    app.use("/api/logout", logout_1.default);
};
exports.setRoutes = setRoutes;
