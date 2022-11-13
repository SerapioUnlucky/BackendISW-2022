const editRController = require('../controllers/editRController');
const express = require('express');
const api = express.Router();
const check = require("../middlewares/authUsers");

api.put('/modificarres/:id', check.auth, editRController.editR);

module.exports = api;