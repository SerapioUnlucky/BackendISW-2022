const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const checkUser = require("../middlewares/authUsers");
const checkAdmin = require("../middlewares/authAdmin");
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

router.post("/subir_imagen/:id", [subidas.single("file0")], userController.subirImagen);
router.get("/ver_imagen/:fichero", userController.conseguirImagen);
router.post("/crear_usuario", userController.createUser);
router.post("/login_usuario", userController.login);
router.get("/ver_perfil/:id", checkUser.auth, userController.viewprofile);
router.get("/ver_perfiles", checkAdmin.auth, userController.viewProfiles);
router.put("/modificar_autorizacion/:id", checkAdmin.auth, userController.updateAuthorization);
router.delete("/eliminar_usuario/:id", checkAdmin.auth, userController.deleteUser);

module.exports = router;
