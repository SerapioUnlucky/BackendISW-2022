const express = require("express");
const adminController = require("../controllers/adminController");
const router = express.Router();
const check = require("../middlewares/authAdmin");

router.post("/login_admin", adminController.login);

module.exports = router;