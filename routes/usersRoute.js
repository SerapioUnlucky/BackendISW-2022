const express = require("express");
const usersController = require("../controllers/usersController");
const router = express.Router();
const check = require("../middlewares/authUsers");
const multer = require("multer");

const almacenamiento = multer.diskStorage({

    destination: function(req, file, cb){
        cb(null, './imagenes/')
    },

    filename: function(req, file, cb){
        cb(null, "user" + Date.now() + file.originalname)
    }

});

const subidas = multer({storage: almacenamiento});

router.post("/subir_imagen/:id", check.auth, [subidas.single("file0")], usersController.subirImagen);
router.get("/ver_imagen/:fichero", check.auth, usersController.conseguirImagen);
router.post("/crear_usuario", usersController.createUsers);
router.post("/login_usuario", usersController.login);
router.get("/ver_perfil/:id", check.auth, usersController.viewprofile);
router.get("/ver_reservas/:id", check.auth, usersController.verReservas);

module.exports = router;
