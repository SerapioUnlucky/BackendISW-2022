const reservarController = require('../controllers/reservarController');
const express = require('express');
const api = express.Router();
const check = require("../middlewares/authUsers");

api.post('/reservar', check.auth, reservarController.crearReservacion);
api.delete('/reservar/delete/:id',reservarController.deleteSpecificReserva);

module.exports = api;