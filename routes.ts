import express from "express";
import log from "./src/logger/loggerdeneme";

const morgan = require("morgan");
const helmet = require("helmet");

import register from "./src/routes/auth/register";
import login from "./src/routes/auth/login";
import role from "./src/routes/roles/roles";
import profile from "./src/routes/profile/profile";
import multilanguage from "./src/routes/multiLanguage/multilanguage";

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
  app.use("/api/role", role);

  app.use("/api/profile", profile);

  app.use("/api/multilanguage", multilanguage);
};
