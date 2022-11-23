const Reserva = require('../models/reservaModel');
const User = require("../models/userModel");
const mantencion = require("../models/mantencion");
const maquina = require("../models/maquina");
const nodemailer = require("nodemailer");

//Listo
const createReservation = (req, res) => {

    //Se recogen los datos del body
    let params = req.body;

    //Validacion de si llegan datos
    if (!params.usuario || !params.fechaReserva || !params.tipo) {
        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validacion de fechas validas
    let date = new Date(params.fechaReserva);
    let hora = date.getHours()+3;
    let dateNow = new Date();

    if(hora < 8 || hora > 21){
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

    //Buscar en el modelo de reserva por la id de usuario para verificar y darle limites de reservas en curso
    Reserva.find({ usuario: params.usuario }, (error, reserva) => {

        //Si el usuario registra ya 4 reservas en curso se activara esta validacion
        if (reserva.length == 4) {

            return res.status(400).send({
                status: "error",
                message: "El usuario ya registra dos reservas"
            });

        }

        //Validacion de disponibilidad de maquinas en la hora ingresada
        mantencion.countDocuments({fechaIni:{"$lte":params.fechaReserva},fechaFin:{"$gte":params.fechaReserva}}, (err, cantMantenciones) => {

            maquina.countDocuments({tipo:params.tipo}, (error, cantMaquinas) => {

                Reserva.countDocuments({fechaReserva:params.fechaReserva, tipo:params.tipo}, (error, cantReservas) => {

                    if(cantMaquinas - cantMantenciones <= cantReservas){

                        return res.status(400).send({
                            status: "error",
                            message: "No hay maquinas disponibles"
                        });

                    }

                    //Validacion de si el usuario esta actualizado
                    User.findOne({ _id: params.usuario }, (error, user) => {

                        if (user.autorizado === "No") {
                            return res.status(400).send({
                                status: "error",
                                message: "No tiene permisos para realizar reservas"
                            });
                        }
            
                        //Crear objeto para guardar en la bd
                        let reserva_to_save = new Reserva(params);
            
                        //Guardar en la bd
                        reserva_to_save.save((error, reserva) => {
            
                            //En caso de error al guardar
                            if (error) {
                                return res.status(400).send({
                                    status: "error",
                                    message: "Ha ocurrido un error al registrar la reserva"
                                });
                            }
            
                            //Constantes para el correo 
                            const message = "Estimado cliente se le informa que se ha realizado con exito la reserva en nuestra lavanderia para la fecha ";
                            const token = process.env.PW;
                            const mail = "servicio.lavanderia2022@gmail.com";

                            //Creacion del transporter de nodemailer
                            const transporter = nodemailer.createTransport({
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: true,
                                auth: {
                                    user: mail,
                                    pass: token
                                }
                            });
            
                            //Cabeza y cuerpo del email
                            const mailOptions = {
                                from: "Administración <" + mail + ">",
                                to: user.email,
                                subject: "Notificacion de reserva",
                                html: "<h3>" + message + date.toLocaleDateString() + " a las  " + hora + " horas " + ", el tipo de servicio a usar es " + params.tipo + "</h3>"
                            }
            
                            //Enviar email
                            transporter.sendMail(mailOptions);
            
                            //Devolver resultado de exito
                            return res.status(200).send({
                                status: "success",
                                message: "La reserva se ha registrado con exito",
                                reserva: reserva
                            });
            
                        });
            
                    });

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
    if (!params.usuario || !params.fechaReserva || !params.tipo) {

        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });

    }

    //Validacion de fechas validas
    let date = new Date(params.fechaReserva);
    let hora = date.getHours()+3;
    let dateNow = new Date();

    if(hora < 8 || hora > 21){
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

    mantencion.countDocuments({fechaIni:{"$lte":params.fechaReserva},fechaFin:{"$gte":params.fechaReserva}}, (err, cantMantenciones) => {

        maquina.countDocuments({tipo:params.tipo}, (error, cantMaquinas) => {

            Reserva.countDocuments({fechaReserva:params.fechaReserva, tipo:params.tipo}, (error, cantReservas) => {

                if(cantMaquinas - cantMantenciones <= cantReservas){

                    return res.status(400).send({
                        status: "error",
                        message: "No hay maquinas disponibles"
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
                        let hora = date.getHours()+3;
            
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
                            html: "<h3>" + message + date.toLocaleDateString() + " a las  " + hora + " horas " + ", el tipo de servicio a usar es " + params.tipo + "</h3>"
                        }
            
                        transporter.sendMail(mailOptions);
            
                        return res.status(200).send({
                            status: "success",
                            message: "Se ha actualizado correctamente la reserva",
                            reservation: reservation
                        });
            
                    });
            
                });

            });

        });

    });

}

//Listo
const deleteReservation = (req, res) => {

    let id = req.params.id;

    Reserva.findOne({ _id: id }, (error, reserva) => {

        let usuario = reserva.usuario;

        let date = new Date(reserva.fechaReserva);
        let dateNow = new Date();

        if(date <= dateNow){
            return res.status(406).send({
                status: "error",
                message: "La reserva no puede ser eliminada debido a que ya paso"
            });
        }

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
