const reservaController = require('../controllers/reservaController');
const express = require('express');
const api = express.Router();
const checkUser = require("../middlewares/authUsers");
const checkAdmin = require("../middlewares/authAdmin");

api.post("/crear_reserva", checkUser.auth, reservaController.createReservation);
api.put("/modificar_reserva/:id", checkUser.auth, reservaController.updateReservation);
api.delete("/eliminar_reserva/:id", checkUser.auth, reservaController.deleteReservation);
api.get("/ver_mis_reservas/:id", checkUser.auth, reservaController.viewReservations);
api.get("/ver_reservas", checkAdmin.auth, reservaController.viewAllReservations);
api.delete("/eliminar_reservas/:id", checkAdmin.auth, reservaController.deleteReservations);

module.exports = api;