const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello world");
});

router.get("/hello-world2", (req, res) => {
  res.send("hello world2");
});
