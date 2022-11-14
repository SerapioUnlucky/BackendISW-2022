const Users = require("../models/usersModel");
const Reservas = require("../models/reserva");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwtUsers");
const fs = require("fs");
const path = require("path");

//Listo
const createUsers = (req, res) => {

    //Recoger datos
    let params = req.body;

    //Validaciones (En proceso...)
    const validacionSoloLetras = /^[a-zA-Z]+$/;
    const validacionSoloNumeros = /^[0-9]+$/;
    const validacionLetrasNumeros = /^[A-Za-z0-9]+\s[A-Za-z0-9]+\s[0-9]+$/;
    const validacionFechaNacimiento = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    const validacionGmail = /^[A-Za-z0-9]+@gmail\.com$/;

    //Validar si llegan los datos
    if(!params.nombre || !params.apellido || !params.rut || !params.email || !params.direccion || !params.fechaNacimiento || !params.contraseña || !params.telefono){
        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validacion de expresiones regulares (En proceso...)
    if(!validacionSoloLetras.test(params.nombre)){
        return res.status(406).json({
            status: "error",
            message: "El nombre es incorrecto, solo se aceptan letras"
        });
    }

    if(!validacionSoloLetras.test(params.apellido)){
        return res.status(406).json({
            status: "error",
            message: "El apellido es incorrecto, solo se aceptan letras"
        })
    }

    if(!validacionSoloNumeros.test(params.rut)){
        return res.status(406).json({
            status: "error",
            message: "El RUT es incorrecto, solo se aceptan números"
        })
    }

    if(params.rut < 30000000 || params.rut > 250000000){
        return res.status(406).json({
            status: "error",
            message: "El RUT ingresado no es el válido"
        })
    }

    if(!validacionGmail.test(params.email)){
        return res.status(406).json({
            status: "error",
            message: "El email es incorrecto, solo se aceptan emails con dominio de Gmail"
        });
    }

    if(!validacionLetrasNumeros.test(params.direccion)){
        return res.status(406).json({
            status: "error",
            message: "La dirección no es válida, solo se aceptan letras y números"
        })
    }

    if(!validacionFechaNacimiento.test(params.fechaNacimiento)){
        return res.status(406).json({
            status:"error",
            message: "La fecha ingresada no es válida, solo se acepta el formato de YYYY-mm-dd"
        })
    }

    if(params.contraseña.length < 9){
        return res.status(406).json({
            status: "error",
            message: "La contraseña ingresada no es válida, el número de caracteres mínimo es de 8"
        })
    }

    if(!validacionSoloNumeros.test(params.telefono)){
        return res.status(406).json({
            status: "error",
            message: "El número de teléfono no es válido, solo se aceptan números"
        });
    }

    if(params.telefono.toString().length != 8){
        return res.status(406).json({
            status: "error",
            message: "El número de teléfono no es válido, solo se acepta el formato de +569-xxxxxxxx"
        })
    }
    
    //Crear objeto de usuario
    let user = new Users(params);

    //Control de usuarios duplicados
    Users.find({ $or: [

        {rut: user.rut},
        {email: user.email},
        {telefono: user.telefono}

    ]}).exec((error, users) => {

        if(error){
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            });
        }

        if(users && users.length >= 1){
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        //Cifrar la contraseña
        bcrypt.hash(user.contraseña, 10, (error, pwd) => {

            if(error){
                return res.status(500).json({
                    status: "error",
                    message: "Error en la consulta"
                });
            }

            user.contraseña = pwd;

            //Guardar datos en la BD
            user.save((error, userSave) => {

                if(error){
                    return res.status(500).json({
                        status: "error",
                        message: "Error en la consulta"
                    });
                }

                //Devolver resultado
                return res.status(200).json({
                    status: "success",
                    message: "Se ha registrado el usuario",
                    user: userSave
                });

            })

        })

    });

}

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
    Users.findOne({email: params.email})
        .exec((error, user) => {

        if(error || !user){
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe"
            });
        }

        //Comprobar si su contraseña es correcta
        const pwd = bcrypt.compareSync(params.contraseña, user.contraseña);

        if(!pwd){
            return res.status(400).json({
                status:"error",
                message:"Contraseña incorrecta por favor inténtelo nuevamente"
            })
        }

        //Devolver token
        const token = jwt.createToken(user);

        //Devolver datos del usuario
        return res.status(200).json({
            status: "success",
            message: "Se ha autenticado correctamente",
            user:{
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido
            },
            token
        });

    });

}

//Listo
const viewprofile = (req, res) => {

    //Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //Consulta para sacar los datos del usuario
    Users.findById(id)
        .select({contraseña: 0})
        .exec((error, userProfile) => {

        //Devolver resultado si usuario no existe
        if(error || !userProfile){
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe"
            });
        }

        //Devolver el resultado
        return res.status(200).json({
            status: "success",
            user: userProfile
        });

    })

}

//Listo
const subirImagen = (req, res) => {

    //Recoger el fichero de imagen subido
    if(!req.file){
        return res.status(404).json({

            status: "error",
            mensaje: "Peticion invalida"

        });
    }

    //Nombre del archivo
    let nombreimagen = req.file.originalname;

    //Extension del archivo
    let imagenSplit = nombreimagen.split("\.");
    let imagenExtension = imagenSplit[1]; 

    //Comprobar extension correcta
    if(imagenExtension != "png" && imagenExtension != "jpg" && imagenExtension != "jpeg"){
        
        //borrar archivo, actualizar el articulo
        fs.unlink(req.file.path, (error) => {

            return res.status(400).json({

                status: "error",
                mensaje: "Archivo invalido"

            });

        });

    }else{

        //Recoger id del articulo a editar
        let user_id = req.params.id;

        //Buscar y actualizar articulo
        Users.findOneAndUpdate({_id: user_id}, {imagen: req.file.filename}, {new: true},(error, userActualizado) => {

            //En caso de error
            if(error || !userActualizado){
                return res.status(500).json({
                    status: "error",
                    mensaje: "Error al actualizar"
                })
            }

            //Devolver respuesta exitosa
            return res.status(200).json({
                status: "success",
                user: userActualizado
            });

        });

    }    

}

//Listo
const conseguirImagen = (req, res) => {

    let fichero = req.params.fichero;
    let ruta_fisica = "./imagenes/"+fichero;

    fs.stat(ruta_fisica, (error, existe) => {
        if(existe){
            return res.sendFile(path.resolve(ruta_fisica));
        }else{
            return res.status(404).json({
                status: "error",
                mensaje: "La imagen no existe"
            });
        }
    });

}

//Listo
const verReservas = (req, res) => {

    //Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //Consulta para sacar los datos del usuario
    Reservas.find({usuario:id})
        .exec((error, reservasUser) => {

        //Devolver resultado si usuario no existe
        if(error || !reservasUser){
            return res.status(404).json({
                status: "error",
                message: "No hay reservas"
            });
        }

        //Devolver el resultado
        return res.status(200).json({
            status: "success",
            reservas: reservasUser
        });

    })
}

module.exports = {
    createUsers,
    login,
    viewprofile,
    subirImagen,
    conseguirImagen,
    verReservas
}