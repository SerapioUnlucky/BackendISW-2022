//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment")

//Clave secreta
const secret = "clave_secreta_lavanderia_2002";

//Crear una funcion para generar tokens
const createToken = (user) => {
    const payload = {
        email: user.email,
        contraseña: user.contraseña,
        iat: moment().unix(),
        exp: moment().add(2, "days").unix()
    }

    //Devolver jwt token codificado
    return jwt.encode(payload, secret);

}

module.exports = {
    secret, 
    createToken
}
