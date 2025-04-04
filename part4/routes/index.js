const express = require("express");
const router = express.Router();

// הצגת העמוד הראשי
router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
