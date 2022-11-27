const Reserva = require('../models/reservaModel');
const User = require("../models/userModel");
const mantencion = require("../models/mantencion");
const maquina = require("../models/maquina");
const nodemailer = require("nodemailer");

//Listo (usuario)
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

    //Buscar en el modelo de reserva por la id de usuario y fecha ingresada 
    Reserva.find({ usuario: params.usuario, fechaReserva: params.fechaReserva }, (error, reserva) => {

        //En caso que el usuario ingresado no exista
        if(!reserva){
            return res.status(406).send({
                status: "error",
                message: "El usuario ingresado no existe"
            });
        }

        //Si el usuario quiere registrar una reserva donde ya tiene registrada una reserva se activara esta validacion
        if (reserva.length === 1) {

            return res.status(400).send({
                status: "error",
                message: "Estimado usuario ya registra una reserva para la fecha y hora seleccionada"
            });

        }

        //Validacion de disponibilidad de maquinas en la hora ingresada
        mantencion.countDocuments({fechaIni:{"$lte":params.fechaReserva},fechaFin:{"$gte":params.fechaReserva}}, (err, cantMantenciones) => {

            maquina.countDocuments({tipo:params.tipo}, (error, cantMaquinas) => {

                Reserva.countDocuments({fechaReserva:params.fechaReserva, tipo:params.tipo}, (error, cantReservas) => {

                    if(cantMaquinas - cantMantenciones <= cantReservas){

                        return res.status(400).send({
                            status: "error",
                            message: "No hay maquinas disponibles para la fecha y hora selecciona"
                        });

                    }

                    //Buscar usuario por parametro usuario
                    User.findOne({ _id: params.usuario }, (error, user) => {

                        //Validacion de si esta autorizado
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

//Listo (usuario)
const updateReservation = (req, res) => {

    //Se recogen parametros del body y la id por url
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

    //Buscar en el modelo de reserva por la id de usuario y fecha ingresada 
    Reserva.find({ usuario: params.usuario, fechaReserva: params.fechaReserva }, (error, reserva) => {

        //En caso que el usuario ingresado no exista
        if(!reserva){
            return res.status(406).send({
                status: "error",
                message: "El usuario ingresado no existe"
            });
        }

        //Si el usuario registra una reserva donde ya tiene registrada una reserva se activara esta validacion
        if (reserva.length === 1) {

            return res.status(400).send({
                status: "error",
                message: "Estimado usuario ya registra una reserva para la fecha y hora seleccionada"
            });

        }

        //Validacion de disponibilidad de maquinas en la hora ingresada
        mantencion.countDocuments({fechaIni:{"$lte":params.fechaReserva},fechaFin:{"$gte":params.fechaReserva}}, (err, cantMantenciones) => {

            maquina.countDocuments({tipo:params.tipo}, (error, cantMaquinas) => {
    
                Reserva.countDocuments({fechaReserva:params.fechaReserva, tipo:params.tipo}, (error, cantReservas) => {
    
                    if(cantMaquinas - cantMantenciones <= cantReservas){
    
                        return res.status(400).send({
                            status: "error",
                            message: "No hay maquinas disponibles para la fecha y hora seleccionada"
                        });
    
                    }
    
                    //Buscar usuario por parametro de usuario
                    User.findOne({ _id: params.usuario }, (error, user) => {
    
                        //Validacion de si esta autorizado
                        if (user.autorizado == "No") {
                            return res.status(400).send({
                                status: "error",
                                message: "No tiene permisos para modificar esta reserva"
                            });
                        }

                        //En caso de que el usuario ingresado no exista
                        if(!user){
                            return res.status(406).send({
                                status: "error",
                                message: "El usuario ingresado no existe"
                            });
                        }
                
                        //Buscar por id y actualizar la reserva
                        Reserva.findByIdAndUpdate(id, params, (error, reservation) => {
                
                            //En caso de error
                            if (error) {
                                return res.status(400).send({
                                    status: "error",
                                    message: "Ha ocurrido un error al actualizar la reserva, intentelo nuevamente"
                                });
                            }

                            //En caso de que no exita la reserva que se quiere modificar
                            if(!reservation){
                                return res.status(406).send({
                                    status: "error",
                                    message: "No hay reserva que modificar"
                                });
                            }
                
                            //Constantes para un email de modificacion
                            const message = "Estimado cliente se le informa que se ha realizado con exito la modificacion de la reserva en nuestra lavanderia para la nueva fecha ";
                            const token = process.env.PW;
                            const mail = "servicio.lavanderia2022@gmail.com";
                            let hora = date.getHours()+3;
                
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
                
                            //Cuerpo del email
                            const mailOptions = {
                                from: "Administración <" + mail + ">",
                                to: user.email,
                                subject: "Modificacion de reserva",
                                html: "<h3>" + message + date.toLocaleDateString() + " a las  " + hora + " horas " + ", el tipo de servicio a usar es " + params.tipo + "</h3>"
                            }
                
                            //Enviar email sobre la modificacion
                            transporter.sendMail(mailOptions);
                
                            //Devolver resultado de exito
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

    });    

}

//Listo (usuario)
const deleteReservation = (req, res) => {

    //Se recoge id de la reserva a eliminar por la url
    let id = req.params.id;

    //Se busca la reserva por la id
    Reserva.findOne({ _id: id }, (error, reserva) => {

        //En caso de no encontrar ninguna reserva a eliminar
        if(!reserva){
            return res.status(406).send({
                status: "error",
                message: "La reserva a eliminar no existe"
            });
        }

        //Se obtiene el usuario de la reserva
        let usuario = reserva.usuario;

        //Declaracion de fechas
        let date = new Date(reserva.fechaReserva);
        let dateNow = new Date();

        //Validacion de si la reserva que desea eliminar se encuentra dentro del rango permitido de fecha
        if(date <= dateNow){
            return res.status(406).send({
                status: "error",
                message: "La reserva no puede ser eliminada debido a que ya paso"
            });
        }

        //Buscar usuario por la id 
        User.findOne({ _id: usuario }, (error, user) => {

            //Constantes para un email de cancelacion
            const message = "Estimado cliente se le informa que se ha cancelado con exito la reserva que tenia agendada en nuestra lavanderia";
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

            //Cuerpo del email
            const mailOptions = {
                from: "Administración <" + mail + ">",
                to: user.email,
                subject: "Cancelacion de reserva",
                html: "<h3>"+message+"</h3>"
            }

            //Se envia email
            transporter.sendMail(mailOptions);

            //Se elimina la reserva
            reserva.delete();

            //Devolver resultado de exito
            return res.status(200).send({
                status: "success",
                message: "Se ha cancelado la reserva con exito"
            });

        });

    });

}

//Listo (usuario)
const viewReservations = (req, res) => {

    //Se recoge id del usuario por la url
    let id = req.params.id;

    //Se obtienen reservas por la id del usuario 
    Reserva.find({usuario:id}, (error, reservations) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }

        //En caso de que no haya reservar para mostrar
        if(reservations.length == 0){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }

        //Devolver resultado de exito
        return res.status(200).send({
            status: "success",
            message: "Se han encontrado las siguientes reservas",
            reservations: reservations
        });

    });

}

//Listo (administrador)
const viewAllReservations = (req, res) => {

    //Se obtienen todas las reservas registradas
    Reserva.find((error, reservations) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }

        //En caso de que no haya reservar para mostrar
        if(reservations.length == 0){
            return res.status(400).send({
                status: "error",
                message: "No se han encontrado reservas"
            });
        }

        //Devolver resultado de exito
        return res.status(200).send({
            status: "success",
            message: "Se encontraron las siguientes reservas",
            reservations: reservations
        });
        
    });

}

module.exports = {
    createReservation,
    updateReservation,
    deleteReservation,
    viewReservations,
    viewAllReservations
}
