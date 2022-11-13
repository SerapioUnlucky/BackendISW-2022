const express = require("express");
const mailController = require("../controllers/mailController");
const router = express.Router();
const check = require("../middlewares/authAdmin");

router.post("/mantencion", check.auth, mailController.enviarAvisoMantencion);

module.exports = router;
