const express = require("express");
const mailController = require("../controllers/mailController");
const router = express.Router();
const checkAdmin = require("../middlewares/authAdmin");

router.post("/mantencion", checkAdmin.auth, mailController.enviarAvisoMantencion);

module.exports = router;
