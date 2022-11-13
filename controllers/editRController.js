const reserva = require("../models/reserva");
const users = require("../models/usersModel");
const nodemailer = require("nodemailer");

//Listo
//Requerimiento de Marcelo Zambrano
const editR = (req, res) => {

    //DECLARACIONES DE VARIABLES
    const { id } = req.params;
    const { usuario, year, month, day, hora, tipo } = req.body
    const fecha = new Date();

    let anio = fecha.getFullYear();
    let mes = fecha.getMonth() + 1;
    let dia = fecha.getDate();
    let hra = fecha.getHours();

    //Validacion de datos ingresados cumplan con rango del mes actual.

    //VALIDACION AÑO
    if (anio != year) {
        return res.status(406).send({ message: "El año ingresado es inválido" })
    }

    //VALIDACION MES
    if (mes != month) {
        return res.status(406).send({ message: "El mes ingresada es inválido" })
    }

    //VALIDACION DIA
    if (dia > day) {
        return res.status(406).send({ message: "El dia ingresado es inválido" })
    }

    //VALIDACION HORA
    if (hra < hora) {
        return res.status(406).send({ message: "La hora ingresada es inválida" })
    }

    //VALIDACION HORA
    if (hora < 8 || hora > 20) {
        return res.status(406).send({ message: "La hora ingresada es inválida" })
    }

    //FUNCION DE BUSQUEDA PARA VER SI LOS DATOS INGRESADOS YA VALIDADOS SE ENCUENTRES DISPONIBLES PARA UNA RESERVA
    reserva.find({ year: year, month: month, day: day, hora: hora, tipo: tipo }, (err, reser) => {

        if (reser.length == 0) {

            //BUSQUEDA POR ID
            reserva.findByIdAndUpdate(id, req.body, (er, resv) => {

                //SI SE ENCUENTA UN ERROR
                if (er) {
                    return res.status(400).send({ message: "Ocurrió un error en la consulta" })
                }

                //SI NO EXISTE RESERVA DISPONIBLE
                if (!resv) {
                    return res.status(404).send({ message: "No se ha podido modificar la reserva" })
                }

                //Requerimiento de Sebastian Jerez(Notificacion de modificacion)
                //Se busca por la id
                users.find({_id:usuario}, (error, user) => {
        
                    //Se crean constantes
                    const message1 = "Estimado cliente se le informa que se ha modificado con éxito la reserva para nuestra lavandería para la nueva fecha ";
                    const message2 = " a las "
                    const message3 = " el tipo de servicio a usar es "
                    const token = process.env.PW;
                    const mail = "servicio.lavanderia2022@gmail.com";
            
                    //Funcion de crear transporter de nodemailer
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: mail,
                            pass: token
                        }
                    });
            
                    //Se recorre el objeto de user
                    user.map(mail => {
            
                        //Cuerpo del correo electronico
                        const mailOptions = {
                            from: "Administración <"+mail+">",
                            to: mail.email,
                            subject: "Modificación de reserva",
                            html: "<h3>"+message1+day+"/"+month+"/"+year+message2+hora+" horas,"+message3+tipo+"</h3>"
                        }
                
                        //Se envia el correo electronico
                        transporter.sendMail(mailOptions, (error, info) => {});
            
                    });
            
                });

                //REALIZA LA MODIFICACION
                return res.status(200).send({ message: "La nueva fecha ha sido reservada" })

            })


        } else {

            //LA RESERVA YA EXISTE
            return res.status(400).json({
                message: "La hora que desea agendar ya existe"
            });

        }

    })

}

module.exports = {
    editR
}