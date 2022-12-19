const micelaneoController = require('../controllers/micelaneoController');
const express = require('express');
const api = express.Router();
const checkAdmin = require("../middlewares/authAdmin");

api.post('/micelaneo/generarInforme', checkAdmin.auth, micelaneoController.generarInforme);

module.exports = api;