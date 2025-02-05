import express, { Request, Response, NextFunction } from "express";
import log from "./src/logger/loggerdeneme";
import {
  apiLimiter,
  authLimiter,
  emailLimiter,
} from "./src/middleware/rateLimiter";

const morgan = require("morgan");
const helmet = require("helmet");

import register from "./src/routes/auth/register";
import login from "./src/routes/auth/login";
import logout from "./src/routes/auth/logout";
import refresh from "./src/routes/auth/refresh";
import passwordReset from "./src/routes/auth/passwordReset";
import emailVerification from "./src/routes/auth/emailVerification";
import profileRouter from "./src/routes/user/profile";
import activityRouter from "./src/routes/user/activity";
import notificationsRouter from "./src/routes/user/notifications";
import sessionRouter from "./src/routes/user/session";
import dietitianProfileRouter from "./src/routes/dietitian/profile";
import twoFactorRouter from "./src/routes/auth/twoFactor";
import dietitianSearchRouter from "./src/routes/dietitian/search";
import appointmentRouter from "./src/routes/appointment";
import chatRouter from "./src/routes/chat";
import foodRouter from "./src/routes/food";
import mealPlanRouter from "./src/routes/mealPlan";
import progressRouter from "./src/routes/progress";
import goalRouter from "./src/routes/goal";
import reportRouter from "./src/routes/report";
import healthRouter from "./src/routes/health";
import analyticsRouter from "./src/routes/analytics";

export const setRoutes = async (app: express.Application) => {
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
  app.use("/api/dietitian", dietitianSearchRouter);

  // Other routes with default limiter
  app.use("/api/appointments", appointmentRouter);
  app.use("/api/logout", logout);
  app.use("/api/refresh", refresh);
  app.use("/api/user/sessions", sessionRouter);
  app.use("/api/auth/2fa", twoFactorRouter);

  // Chat routes
  app.use("/api/chats", chatRouter);

  // Food routes
  app.use("/api/foods", foodRouter);

  // Meal plan routes
  app.use("/api/meal-plans", mealPlanRouter);

  // Progress tracking routes
  app.use("/api/progress", progressRouter);

  // Goal routes
  app.use("/api/goals", goalRouter);

  // Report routes
  app.use("/api/reports", reportRouter);

  // Health app routes
  app.use("/api/health", healthRouter);

  // Analytics routes
  app.use("/api/analytics", analyticsRouter);
};
