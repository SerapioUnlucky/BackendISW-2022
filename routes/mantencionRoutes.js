const mantencionController = require('../controllers/mantencionController');
const express = require('express');
const api = express.Router();
const checkAdmin = require("../middlewares/authAdmin");

api.post('/mantencion/crear', checkAdmin.auth, mantencionController.crearMantencion);
api.delete('/mantencion/eliminar/:id', checkAdmin.auth, mantencionController.eliminarMantencion);
api.put('/mantencion/modificar', checkAdmin.auth, mantencionController.modificarMantencion);
api.get('/mantencion/obtener/todos', checkAdmin.auth, mantencionController.obtenerMantenciones);
api.get('/mantencion/obtener_unico/:id', checkAdmin.auth, mantencionController.obtenerMantencion);

module.exports = api;