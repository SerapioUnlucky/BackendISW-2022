const editRController = require('../controllers/editRController');
const express = require('express');
const api = express.Router();

api.put('/modificarres/:id',editRController.editR);

module.exports = api;