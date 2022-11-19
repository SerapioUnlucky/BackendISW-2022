const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Users = require("../models/userModel");
dotenv.config();

//Listo
//Requerimiento de Sebastian Jerez
const enviarAvisoMantencion = (req, res) => {

    const { message } = req.body;
    const token = process.env.PW;
    const mail = "servicio.lavanderia2022@gmail.com";

    if (!token) {
        return res.status(400).json({
            status: "error",
            message: "No se ha entregado la contraseña de email"
        });
    }

    if(!message){
        return res.status(406).json({
            status:"error",
            message:"Por favor ingrese un mensaje a notificar"
        })
    }

    if(message.length < 10 || message.length > 400){
        return res.status(406).json({
            status:"error",
            message:"La cantidad de caracteres no es válida"
        })
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: mail,
            pass: token
        }
    });

    Users.find((error, users) => {

        users.map(mail => {

            const mailOptions = {
                from: "Administración <"+mail+">",
                to: mail.email,
                subject: "Aviso de mantención de la lavandería",
                html: "<h3>"+message+"</h3>"
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(400).json({
                        status: "error",
                        message: "Error al enviar el correo"
                    });
                }

                return res.status(200).json({
                    status: "success",
                    message: "¡Correo enviado con éxito!"
                });

            });

        })

    })

}

module.exports = {
    enviarAvisoMantencion
}
