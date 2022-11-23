const mantencionController = require('../controllers/mantencionController');
const express = require('express');
const api = express.Router();

api.post('/mantencion/crear',mantencionController.crearMantencion);
api.delete('/mantencion/eliminar/:id', mantencionController.eliminarMantencion);
api.put('/mantencion/modificar', mantencionController.modificarMantencion);
api.get('/mantencion/obtener/todos', mantencionController.obtenerMantenciones);
api.get('/mantencion/obtener_unico/:id', mantencionController.obtenerMantencion);

module.exports = api;