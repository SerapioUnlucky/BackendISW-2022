const reserva = require('../models/reserva');
const users = require("../models/usersModel");
const nodemailer = require("nodemailer");

//Listo
//Requerimiento de Samuel Sanhueza
const crearReservacion = (req, res) => {

    //Se recogen los datos del body
    const {usuario,year,month,day,tipo,hora} = req.body;

    //Se obtiene el mes, año, dia y hora actual
    let fecha = new Date();
    let mesActual = fecha.getMonth()+1;
    let anioActual = fecha.getFullYear();
    let diaActual = fecha.getDate();
    let horaActual = fecha.getHours();

    //Validaciones de fechas
    if(year != anioActual){
        return res.status(406).json({
            status: "error",
            message: "El año ingresado no es válido"
        });
    }

    if(month != mesActual){
        return res.status(406).json({
            status: "error",
            message: "El mes ingresado no es válido"
        });
    } 

    if(day < diaActual){
        return res.status(406).json({
            status: "error",
            message: "El dia ingresado no es válido"
        });
    }

    if(hora < 8 || hora > 20){
        return res.status(406).json({
            status: "error",
            message: "La hora ingresada no es válida"
        });
    }

    if(day == diaActual && hora <= horaActual){
        return res.status(406).json({
            status: "error",
            message: "No se permite reservar horas ya pasadas del dia"
        });
    }

    //validadcion disponibilidad aqui
    reserva.find({year:year, month:month, day:day, hora:hora, tipo: tipo}, (err,reserv)=>{
        if(err){

            //En caso de error
            return res.status(404).json({
                status: "error",
                message: "Hubo un error en la consulta"
            });

        }else{

            //Si no hay una reserva para ese dia procede a guardar
            if(reserv.length == 0){

                const newReservacion = new reserva({
                    usuario,
                    year,
                    month,
                    day,
                    tipo,
                    hora
                });

                try{

                    //Se guarda en la BD
                    newReservacion.save();

                    //Requerimiento Sebastian Jerez (Enviar comprobante de reserva)
                    //Se busca en el modelo con el filtro del id de usuario
                    users.find({_id:usuario}, (error, user) => {
        
                        //Se crean constantes
                        const message1 = "Estimado cliente se le informa que se ha realizado con éxito la reserva para nuestra lavandería para la fecha ";
                        const message2 = " a las ";
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
                                subject: "Notificación de reserva",
                                html: "<h3>"+message1+day+"/"+month+"/"+year+message2+hora+" horas,"+message3+tipo+"</h3>"
                            }
                    
                            //Se envia el correo electronico
                            transporter.sendMail(mailOptions, (error, info) => {});
                
                        });
                
                    });

                    //Devuelve resultado de exito
                    res.status(201).json({
                        message: "Hora reservada correctamente"
                    });
                    
                }
                catch(error){

                    //Devuelve resultado de posible error
                    res.status(400).json({
                        message: "No se ha podido reservar"
                    });

                }

            }else{

                //Devuelve resultado de que ya hay una reserva en ese horario
                return res.status(400).send({
                    message:"Ya existe la reserva",
                    reser:reserv
                });

            }
            
        }
    });
     
}

module.exports = {
    crearReservacion
}