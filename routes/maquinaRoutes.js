const maquinaController = require('../controllers/maquinaController');
const express = require('express');
const api = express.Router();
const checkAdmin = require("../middlewares/authAdmin");

api.post('/maquina/crear_maquina', checkAdmin.auth, maquinaController.crearMaquina);
api.delete('/maquina/eliminar_maquina/:id', checkAdmin.auth, maquinaController.eliminarMaquina);
api.put('/maquina/modificar_serial/:id', checkAdmin.auth, maquinaController.modificarSerialMaquina);
api.get('/maquina/obtener_todos', checkAdmin.auth, maquinaController.obtenerMaquinas);
api.get('/maquina/obtener_lavadoras', checkAdmin.auth, maquinaController.obtenerLavadoras);
api.get('/maquina/obtener_secadoras', checkAdmin.auth, maquinaController.obtenerSecadoras);
api.get('/maquina/obtener_unico/:id', checkAdmin.auth, maquinaController.obtenerMaquina);

module.exports = api;
