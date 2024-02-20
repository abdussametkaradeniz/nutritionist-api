const express = require("express");
const router = express.Router();

const courses = [
  { id: 1, name: "xxxxx" },
  { id: 2, name: "xxxxx" },
  { id: 3, name: "xxxxx" },
];
router.get("/", (req, res) => {
  res.send(courses);
});

router.listen(3000, () => console.log("listen"));

module.exports = router;