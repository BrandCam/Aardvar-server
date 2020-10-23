const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log(req);
    let user = await User.find({ email: req.body.email });

    res.json({
      ...user,
    });
  } catch (err) {
    res.json({
      message: err.message,
      stack: err.stack,
    });
  }
});

module.exports = router;
