import express from "express";
import log from "./src/logger/logger";
const morgan = require("morgan");
const helmet = require("helmet");
import register from "./src/routes/auth/register";
import login from "./src/routes/auth/login";
import role from "./src/routes/roles/roles";
import postAdd from "./src/routes/profile/addPost"
import getPost from "./src/routes/profile/getPost"
import mainPagePost from "./src/routes/profile/mainPost"
import profileCover from "./src/routes/profile/profileCover"
import { jwt } from "./src/middleware/jwt";

export const setRoutes = (app: express.Application) => {
  app.use(express.json()); //req.body
  app.use(express.urlencoded({ extended: true })); //key value olarak parse eder
  app.use(log);
  if (app.get("env") === "development") {
    app.use(morgan()); //console icerisinde nereye istek gittigini soyler
  }
  app.use(express.static("public")); //public klasoru altindaki her seye erisim saglar link ile ornegin localhost:3000/readme.txt
  app.use(helmet());

  app.use("/api/register", register);
  app.use("/api/login", login);
  app.use("/api/role", role);

  app.use("/api/getPost",getPost);
  app.use("/api/postAdd",postAdd);
  app.use("/api/mainPagePost",mainPagePost);
  app.use("/api/profileCover",profileCover);
 
};
