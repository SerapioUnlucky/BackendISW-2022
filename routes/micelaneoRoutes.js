const micelaneoController = require('../controllers/micelaneoController');
const express = require('express');
const api = express.Router();

api.get('/micelaneo/generarInforme',micelaneoController.generarInforme);

module.exports = api;