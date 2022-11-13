const informeController = require('../controllers/informeController');
const express = require('express');
const api = express.Router();
const check = require("../middlewares/authAdmin");

api.get('/informeMensual', check.auth, informeController.generarInforme);

module.exports = api;