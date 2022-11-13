//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment")

//Clave secreta
const secret = "clave_secreta_lavanderia_2003";

//Crear una funcion para generar tokens
const createToken = (admin) => {
    const payload = {
        email: admin.email,
        contraseña: admin.contraseña,
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