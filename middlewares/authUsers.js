//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../services/jwtUsers");
const secret = libjwt.secret;

//Funcion de autenticacion
exports.auth = (req, res, next) => {

    //console.log(req.params);

    //Comprobar si llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).json({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        });
    }

    //Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    //Decodificar el token
    try{

        let payload = jwt.decode(token, secret);

        //Comprobar expiracion del token
        if(payload.exp <= moment().unix()){

            return res.status(404).json({
                status: "error",
                message: "Token expirado",
            });

        }

        //Agregar datos de usuario a request
        req.user = payload;

    }catch(error){
        return res.status(404).json({
            status: "error",
            message: "Token inválido",
        });
    }

    //Pasar a ejecucion de accion
    next();

}

