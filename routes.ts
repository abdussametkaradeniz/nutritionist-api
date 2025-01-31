import express, { Request, Response, NextFunction } from "express";
import log from "./src/logger/loggerdeneme";
import {
  apiLimiter,
  authLimiter,
  emailLimiter,
  initializeRateLimiter,
} from "./src/middleware/rateLimiter";
import { rateLimit } from "express-rate-limit";

const morgan = require("morgan");
const helmet = require("helmet");

import register from "./src/routes/auth/register";
import login from "./src/routes/auth/login";
import permissions from "./src/routes/rolePermissions/permissions";
import appointment from "./src/routes/appointments/appointment";
import logout from "./src/routes/auth/logout";
import userProcess from "./src/routes/users/userProcess";
import refresh from "./src/routes/auth/refresh";
import passwordReset from "./src/routes/auth/passwordReset";
import emailVerification from "./src/routes/auth/emailVerification";
import profileRouter from "./src/routes/user/profile";
import activityRouter from "./src/routes/user/activity";
import notificationsRouter from "./src/routes/user/notifications";
import sessionRouter from "./src/routes/user/session";
import dietitianProfileRouter from "./src/routes/dietitian/profile";

export const setRoutes = async (app: express.Application) => {
  // Redis rate limiter'ı başlat
  await initializeRateLimiter();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(log);
  if (app.get("env") === "development") {
    app.use(morgan("combined"));
  }
  app.use(express.static("public"));
  app.use(helmet());

  // Global rate limiter - tüm API rotalarına uygula
  app.use("/api", apiLimiter);

  // Auth routes with specific limiters
  app.use("/api/login", authLimiter, login);
  app.use("/api/register", authLimiter, register);
  app.use("/api/auth/password-reset", emailLimiter, passwordReset);
  app.use("/api/auth/email-verification", emailLimiter, emailVerification);

  // User management routes
  app.use("/api/user/profile", profileRouter);
  app.use("/api/user/activity", activityRouter);
  app.use("/api/user/notifications", notificationsRouter);

  // Dietitian routes
  app.use("/api/dietitian/profile", dietitianProfileRouter);

  // Other routes with default limiter
  app.use("/api/role-permission", permissions);
  app.use("/api/appointments", appointment);
  app.use("/api/user-process", userProcess);
  app.use("/api/logout", logout);
  app.use("/api/refresh", refresh);
  app.use("/api/user/sessions", sessionRouter);
};
