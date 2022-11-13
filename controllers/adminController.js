const Admin = require("../models/adminModel");
const Users = require("../models/usersModel");
const Reservas = require("../models/reserva");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwtAdmin");

//Listo
const login = (req, res) => {

    //Recoger parametros
    let params = req.body;

    //Validar si llegan datos
    if(!params.email || !params.contraseña){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Buscar en la BD si existe
    Admin.findOne({email: params.email})
        .exec((error, admin) => {

        if(error || !admin){
            return res.status(404).json({
                status: "error",
                message: "El admin no existe"
            });
        }

        //Comprobar si su contraseña es correcta
        const pwd = bcrypt.compareSync(params.contraseña, admin.contraseña);

        if(!pwd){
            return res.status(400).json({
                status:"error",
                message:"Contraseña incorrecta por favor inténtelo nuevamente"
            })
        }

        //Devolver token
        const token = jwt.createToken(admin);

        //Devolver datos del usuario
        return res.status(200).json({
            status: "success",
            message: "Se ha autenticado correctamente",
            admin:{
                id: admin._id,
                email: admin.email
            },
            token
        });

    });

}

//Listo
const viewProfiles = (req, res) => {

    Users.find((error, users) => {

        if(error || !users){
            return res.status(400).json({
                status: "error",
                message: "No hay usuarios para mostrar"
            })
        }

        return res.status(200).json({
            status: "success",
            users
        });

    })

}

//Listo
//Requerimiento de Sebastian Jerez
const deleteReservations = (req, res) => {

    //Recoger datos del body
    const {mes, año} = req.body;

    if(!mes){
        return res.status(406).json({
            status:"error",
            message:"Por favor ingrese un mes"
        })
    }

    if(!año){
        return res.status(406).json({
            status:"error",
            message:"Por favor ingrese un año"
        })
    }

    //Se obtiene el mes, año, dia y hora actual
    let fecha = new Date;
    let mesActual = fecha.getMonth()+1;
    let anioActual = fecha.getFullYear();

    if(mes >= mesActual){
        return res.status(400).json({
            status: "error",
            message: "El mes ingresado no puede ser mayor o igual al mes actual"
        });
    }

    if(año > anioActual){
        return res.status(400).json({
            status: "error",
            message: "El año ingresado no puede ser mayor"
        })
    }
 
    //Buscar las reservas mediante los parametros que nos entrego el body
    Reservas.find({month:mes, year:año},(error, reservations) => {

        if(error){
            return res.status(400).json({
                status:"error",
                message: "Hubo un error en la consulta"
            })
        }

        if(reservations.length == 0){
            return res.status(404).json({
                status:"error",
                message: "No hay reservas que eliminar"
            })
        }

        //Recorrer el objeto del resultado de la busqueda anterior
        reservations.map(reservation => {

            //Eliminar las reservas
            reservation.delete((error, eliminacion) => {

                //En caso de error
                if(error){
                    return res.status(404).json({
                        status:"error",
                        message: "Ha ocurrido un problema con la eliminación"
                    });
                }
                
            });

        });

        //Devolver resultado de exito
        return res.status(200).json({
            status:"success",
            message: "Se han eliminado las reservas"
        });

    })   

}

module.exports = {
    login,
    viewProfiles,
    deleteReservations
}
