const Reserva = require('../models/reservaModel');
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

//Listo
const createReservation = (req, res) => {

    //Se recogen los datos del body
    let params = req.body;

    //Validacion de si llegan datos
    if (!params.usuario || !params.fechaReserva) {
        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validacion de fechas validas
    let date = new Date(params.fechaReserva);
    let dateNow = new Date();

    if(date.getHours() < 8 || date.getHours() > 21){
        return res.status(406).send({
            status: "error",
            message: "La hora ingresada no es valida"
        });
    }

    if(date.getTime() <= dateNow.getTime()){
        return res.status(406).send({
            status: "error",
            message: "La fecha ingresada no es valida"
        });
    }

    Reserva.find({ usuario: params.usuario }, (error, reserva) => {

        if (reserva.length == 2) {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya registra dos reservas"
            });

        }

        User.findOne({ _id: params.usuario }, (error, user) => {

            if (user.autorizado === "No") {
                return res.status(400).send({
                    status: "error",
                    message: "No tiene permisos para realizar reservas"
                });
            }

            let reserva_to_save = new Reserva(params);

            reserva_to_save.save((error, reserva) => {

                if (error) {
                    return res.status(400).send({
                        status: "error",
                        message: "Ha ocurrido un error al registrar la reserva"
                    });
                }

                const message = "Estimado cliente se le informa que se ha realizado con exito la reserva en nuestra lavanderia para la fecha ";
                const token = process.env.PW;
                const mail = "servicio.lavanderia2022@gmail.com";

                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: mail,
                        pass: token
                    }
                });

                const mailOptions = {
                    from: "Administración <" + mail + ">",
                    to: user.email,
                    subject: "Notificacion de reserva",
                    html: "<h3>" + message + params.fechaReserva + ", el tipo de servicio a usar es " + params.tipo + "</h3>"
                }

                transporter.sendMail(mailOptions);

                return res.status(200).send({
                    status: "success",
                    message: "La reserva se ha registrado con exito",
                    reserva: reserva
                });

            });

        });

    });

}

//Listo
const updateReservation = (req, res) => {

    let id = req.params.id;
    let params = req.body;

    //Validacion de si llegan datos
    if (!params.usuario || !params.fechaReserva) {
        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validacion de fechas validas
    let date = new Date(params.fechaReserva);
    let dateNow = new Date();

    if(date.getHours() < 8 || date.getHours() > 21){
        return res.status(406).send({
            status: "error",
            message: "La hora ingresada no es valida"
        });
    }

    if(date.getTime() <= dateNow.getTime()){
        return res.status(406).send({
            status: "error",
            message: "La fecha ingresada no es valida"
        });
    }

    User.findOne({ _id: params.usuario }, (error, user) => {

        if (user.autorizado == "No") {
            return res.status(400).send({
                status: "error",
                message: "No tiene permisos para modificar esta reserva"
            });
        }

        Reserva.findByIdAndUpdate(id, params, (error, reservation) => {

            if (error) {
                return res.status(400).send({
                    status: "error",
                    message: "Ha ocurrido un error al actualizar la reserva, intentelo nuevamente"
                });
            }

            const message = "Estimado cliente se le informa que se ha realizado con exito la modificacion de la reserva en nuestra lavanderia para la nueva fecha ";
            const token = process.env.PW;
            const mail = "servicio.lavanderia2022@gmail.com";

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: mail,
                    pass: token
                }
            });

            const mailOptions = {
                from: "Administración <" + mail + ">",
                to: user.email,
                subject: "Modificacion de reserva",
                html: "<h3>" + message + params.fechaReserva + " horas" +", el tipo de servicio a usar es " + params.tipo + "</h3>"
            }

            transporter.sendMail(mailOptions);

            return res.status(200).send({
                status: "success",
                message: "Se ha actualizado correctamente la reserva",
                reservation: reservation
            })

        })

    });

}

//Listo
const deleteReservation = (req, res) => {

    let id = req.params.id;

    Reserva.findOne({ _id: id }, (error, reserva) => {

        let usuario = reserva.usuario;

        User.findOne({ _id: usuario }, (error, user) => {

            const message = "Estimado cliente se le informa que se ha cancelado con exito la reserva que tenia agendada en nuestra lavanderia";
            const token = process.env.PW;
            const mail = "servicio.lavanderia2022@gmail.com";

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: mail,
                    pass: token
                }
            });

            const mailOptions = {
                from: "Administración <" + mail + ">",
                to: user.email,
                subject: "Cancelacion de reserva",
                html: "<h3>"+message+"</h3>"
            }

            transporter.sendMail(mailOptions);

            reserva.delete();

            return res.status(200).send({
                status: "success",
                message: "Se ha cancelado la reserva con exito"
            });

        });

    });

}

//Listo
const viewReservations = (req, res) => {

    let id = req.params.id;

    Reserva.find({usuario:id}, (error, reservations) => {

        if(error){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Se han encontrado las siguientes reservas",
            reservations: reservations
        });

    });

}

//Listo
const viewAllReservations = (req, res) => {

    Reserva.find((error, reservations) => {
        if(error || !reservations){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }
        return res.status(200).send({
            status: "success",
            message: "Se encontraron las siguientes reservas",
            reservations: reservations
        })
    });

}

module.exports = {
    createReservation,
    updateReservation,
    deleteReservation,
    viewReservations,
    viewAllReservations
}
