import express from "express";
import log from "./src/logger/loggerdeneme";

const morgan = require("morgan");
const helmet = require("helmet");

import register from "./src/routes/auth/register";
import login from "./src/routes/auth/login";
import permissions from "./src/routes/rolePermissions/permissions";
import appointment from "./src/routes/appointments/appointment";

export const setRoutes = (app: express.Application) => {
  app.use(express.json()); //req.body
  app.use(express.urlencoded({ extended: true })); //key value olarak parse eder
  app.use(log);
  if (app.get("env") === "development") {
    app.use(morgan("combined")); //console icerisinde nereye istek gittigini soyler
  }
  app.use(express.static("public")); //public klasoru altindaki her seye erisim saglar link ile ornegin localhost:3000/readme.txt
  app.use(helmet());

  app.use("/api/register", register);
  app.use("/api/login", login);
  app.use("/api/role-permission", permissions);
  app.use("/api/appointments", appointment);
};
