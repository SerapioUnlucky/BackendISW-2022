const maquinaController = require('../controllers/maquinaController');
const express = require('express');
const api = express.Router();

api.post('/maquina/crear_maquina',maquinaController.crearMaquina);
api.delete('/maquina/eliminar_maquina/:id', maquinaController.eliminarMaquina);
api.put('/maquina/modificar_serial/:id', maquinaController.modificarSerialMaquina);
api.get('/maquina/obtener_todos', maquinaController.obtenerMaquinas);
api.get('/maquina/obtener_lavadoras', maquinaController.obtenerLavadoras);
api.get('/maquina/obtener_secadoras', maquinaController.obtenerSecadoras);
api.get('/maquina/obtener_unico/:id', maquinaController.obtenerMaquina);

module.exports = api;