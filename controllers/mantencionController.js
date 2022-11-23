const { map } = require('..');
const mantencion = require('../models/mantencion');
const maquina = require('../models/maquina');
const reserva = require('../models/reservaModel');
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const crearMantencion = async (req, res) => {
    const { fechaIni, fechaFin, maquinaid } = req.body;

    if(!fechaIni||!fechaFin||!maquinaid){
        return res.status(400).send({message:"faltan datos"})
    }

    let fechaInicio = new Date(fechaIni);
    let fechaFinal = new Date(fechaFin);
    fechaInicio.setHours(0, 0, 0, 0)
    fechaFinal.setHours(0, 0, 0, 0)

    if (fechaInicio.getTime() > fechaFinal.getTime()) {
        return res.status(400).send({
            message: "la fecha final no puede ser menor a la fecha de inicio"
        })
    }

    let tipoMan = await queTipo(maquinaid);

    const newMantencion = new mantencion({
        fechaIni: fechaInicio,
        fechaFin: fechaFinal,
        maquinaid: maquinaid,
        tipo: tipoMan
    })

    try {
        await newMantencion.save();

        //! INICIO ELIM 

        let rangres = await rangoReserv(fechaInicio, fechaFinal, tipoMan)
        let coincidencias = new Map()

        for (let re in rangres) {
            let fech = new Date(rangres[re].fechaReserva)
            let fechtime = fech.getTime();
            coincidencias.set(fechtime, coincidencias.get(fech.getTime()) + 1 || 1);
        }

        let macs = await macsPorTipo(tipoMan)
        coincidencias.forEach((value, key) => {
            let fechaLoca = new Date(key)

            mantencion.countDocuments({ fechaIni: { "$lte": fechaLoca.toJSON() }, fechaFin: { "$gte": fechaLoca.toJSON() }, tipo: tipoMan }, function (err, data) {
                if (err) throw err
                let numMantenciones = data;
                if (macs - numMantenciones < value) {
                    //HAY RESERVAS SOBRANTES
                    reserva.find({ tipo: tipoMan, fechaReserva: fechaLoca.toJSON() }, function (err, dat) {
                        let act = 1;
                        let idLast = 0;
                        for (let a in dat) {
                            if (dat[a].createdAt.getTime() > dat[act].createdAt.getTime()) {
                                act = a
                                idLast = dat[a]._id;
                            }
                        }

                        if (idLast != 0) {

                            reserva.findById(idLast, (error, user) => {

                                User.findById(user.usuario, (error, use) => {

                                    const message = "Estimado cliente se le informa que se ha eliminado su reserva debido a una mantencion programa para ese mismo y hora, por favor le pedimos que vuelva a realizar una reserva en otro horario.";
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
                                        to: use.email,
                                        subject: "Notificacion de eliminacion de reserva",
                                        html: "<h3>" + message + "</h3>"
                                    }

                                    transporter.sendMail(mailOptions);

                                });

                            });

                            reserva.findByIdAndDelete(idLast, function (err) {
                                if (err) throw err
                            })
                        }

                    })
                }
            })

        })
        //! FIN ELIMINACION

        return res.status(201).json({
            message: "hora reservada correctamente"
        })
    } catch (error) {
        if (error) throw error;
        return res.status(406).send({
            err: error,
            message: "No se pudo crear la mantencion"
        })
    }
}

const eliminarMantencion = (req, res) => {

    let id = req.params.id;

    mantencion.findByIdAndRemove(id, function (err, data) {
        if (!err) {
            return res.status(201).send({ message: "mantencion eliminada" });
        } else {
            return res.status(400).send({ message: "No se pudo eliminar la mantension" })
        }
    })

}

const modificarMantencion = async (req, res) => {
    
    const { id, fechaIni, fechaFin, maquinaid } = req.body;

    let fechaInicio = new Date(fechaIni);
    let fechaFinal = new Date(fechaFin);
    fechaInicio.setHours(0, 0, 0, 0)
    fechaFinal.setHours(0, 0, 0, 0)

    if (fechaInicio.getTime() < fechaFinal.getTime()) {
        return res.status(400).send({
            message: "la fecha de inicio no puede ser menor a la fecha final"
        })
    }

    await mantencion.findByIdAndUpdate(id, { fechaIni: fechaInicio, fechaFin: fechaFinal, maquinaid: maquinaid }, function (err, data) {
        if (err) {
            return res.status(400).send({ message: "No se pudo modificar la mantencion" })
        }
    })
    let tipoMan = await queTipo(maquinaid);


    //! INICIO ELIM 

    let rangres = await rangoReserv(fechaInicio, fechaFinal, tipoMan)
    let coincidencias = new Map()

    for (let re in rangres) {
        let fech = new Date(rangres[re].fechaReserva)
        let fechtime = fech.getTime();
        coincidencias.set(fechtime, coincidencias.get(fech.getTime()) + 1 || 1);
    }

    let macs = await macsPorTipo(tipoMan)
    coincidencias.forEach((value, key) => {
        let fechaLoca = new Date(key)

        mantencion.countDocuments({ fechaIni: { "$lte": fechaLoca.toJSON() }, fechaFin: { "$gte": fechaLoca.toJSON() }, tipo: tipoMan }, function (err, data) {
            if (err) throw err
            let numMantenciones = data;
            if (macs - numMantenciones < value) {
                //HAY RESERVAS SOBRANTES
                reserva.find({ tipo: tipoMan, fechaReserva: fechaLoca.toJSON() }, function (err, dat) {
                    let act = 1;
                    let idLast = 0;
                    for (let a in dat) {
                        if (dat[a].createdAt.getTime() > dat[act].createdAt.getTime()) {
                            act = a
                            idLast = dat[a]._id;
                        }
                    }
                    
                    if (idLast != 0) {

                        reserva.findById(idLast, (error, user) => {

                            User.findById(user.usuario, (error, use) => {

                                const message = "Estimado cliente se le informa que se ha eliminado su reserva debido a una mantencion programa para ese mismo y hora, por favor le pedimos que vuelva a realizar una reserva en otro horario.";
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
                                    to: use.email,
                                    subject: "Notificacion de eliminacion de reserva",
                                    html: "<h3>" + message + "</h3>"
                                }

                                transporter.sendMail(mailOptions);

                            });

                        });

                        reserva.findByIdAndDelete(idLast, function (err) {
                            if (err) throw err
                        });

                    }

                });

            }

        });

    });
    //! FIN ELIMINACION

    return res.status(201).send({
        message: "mantencion modificada"
    });

}

const obtenerMantenciones = (req, res) => {

    mantencion.find({}, function (err, data) {
        if (!err) {
            return res.status(201).send({
                mantenciones: data,
                message: "mantenciones obtenidas"
            }
            );
        } else {
            return res.status(400).send({ message: "No se pudo obtener las mantenciones" })
        }
    })
}

const obtenerMantencion = (req, res) => {

    let id = req.params.id;

    mantencion.findById(id, function (err, data) {
        if (!err) {
            return res.status(201).send({
                mantenciones: data,
                message: "mantencion obtenida"
            }
            );
        } else {
            return res.status(400).send({ message: "No se pudo obtener la mantencion" })
        }
    })
}

module.exports = {
    crearMantencion,
    eliminarMantencion,
    modificarMantencion,
    obtenerMantencion,
    obtenerMantenciones
}


//* ZONA FUNCIONES PROMISE

const queTipo = (id) => {
    return new Promise((resolve, reject) => {
        maquina.findOne({ _id: id }, function (err, data) {
            if (err) throw err;
            resolve(data.tipo)
        })

    })

}

const macsPorTipo = (tipo) => {
    return new Promise((resolve, reject) => {
        maquina.countDocuments({ tipo: tipo }, function (err, data) {
            if (err) throw err;
            resolve(data)
        })
    })
}

const rangoReserv = (fechaInicio, fechaFinal, tipoMan) => {
    return new Promise((resolve, reject) => {
        reserva.find({ fechaReserva: { "$gte": fechaInicio.toJSON(), "$lte": fechaFinal.toJSON() }, tipo: tipoMan }, function (err, data) {
            resolve(data);
        })
    })
}
