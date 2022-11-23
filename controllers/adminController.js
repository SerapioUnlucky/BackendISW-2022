const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwtAdmin");

//Listo
const login = (req, res) => {

    //Recoger parametros
    let params = req.body;

    //Validar si llegan datos
    if(!params.email || !params.contraseña){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Buscar en la BD si existe
    Admin.findOne({email: params.email})
        .exec((error, admin) => {

        if(error || !admin){
            return res.status(404).json({
                status: "error",
                message: "El admin no existe"
            });
        }

        //Comprobar si su contraseña es correcta
        const pwd = bcrypt.compareSync(params.contraseña, admin.contraseña);

        if(!pwd){
            return res.status(400).json({
                status:"error",
                message:"Contraseña incorrecta por favor inténtelo nuevamente"
            })
        }

        //Devolver token
        const token = jwt.createToken(admin);

        //Devolver datos del usuario
        return res.status(200).json({
            status: "success",
            message: "Se ha autenticado correctamente",
            admin:{
                id: admin._id,
                email: admin.email
            },
            token
        });

    });

}

module.exports = {
    login
}
