const express = require("express");
const adminController = require("../controllers/adminController");
const router = express.Router();
const check = require("../middlewares/authAdmin");

router.post("/login_admin", adminController.login);
router.get("/ver_usuarios", check.auth, adminController.viewProfiles);
router.delete("/eliminar_reservas", check.auth, adminController.deleteReservations);

module.exports = router;