const User = require("../models/userModel");
const Reserva = require("../models/reservaModel");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwtUsers");
const fs = require("fs");
const path = require("path");

//Listo (usuario)
const createUser = (req, res) => {

    //Recoger datos
    let params = req.body;

    //Validaciones
    const validacionSoloLetras = /^[a-zA-Z]+$/;
    const validacionSoloNumeros = /^[0-9]+$/;
    const validacionFechaNacimiento = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    const validacionCorreo = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/; 

    //Validar si llegan los datos
    if(!params.nombre || !params.apellido || !params.rut || !params.email || !params.direccion || !params.fechaNacimiento || !params.contraseña || !params.telefono){
        return res.status(406).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validacion de solo letras en el nombre del usuario
    if(!validacionSoloLetras.test(params.nombre)){
        return res.status(406).json({
            status: "error",
            message: "El nombre es incorrecto, solo se aceptan letras"
        });
    }

    //Validacion de solo letras en el apellido del usuario
    if(!validacionSoloLetras.test(params.apellido)){
        return res.status(406).json({
            status: "error",
            message: "El apellido es incorrecto, solo se aceptan letras"
        })
    }

    //Validacion de solo numeros en el rut
    if(!validacionSoloNumeros.test(params.rut)){
        return res.status(406).json({
            status: "error",
            message: "El RUT es incorrecto, solo se aceptan números"
        })
    }

    //Validacion de ingresar un rut correcto
    if(params.rut < 30000000 || params.rut > 250000000){
        return res.status(406).json({
            status: "error",
            message: "El RUT ingresado no es el válido"
        })
    }

    //Validacion del formato de ingreso de la fecha
    if(!validacionFechaNacimiento.test(params.fechaNacimiento)){
        return res.status(406).json({
            status:"error",
            message: "La fecha ingresada no es válida, solo se acepta el formato de YYYY-mm-dd"
        })
    }

    //Validacion del email
    if(!validacionCorreo.test(params.email)){
        return res.status(406).send({
            status: "error",
            message: "El correo ingresado no es válido"
        });
    }

    //Validacion del largo de la contraseña
    if(params.contraseña.length < 9){
        return res.status(406).json({
            status: "error",
            message: "La contraseña ingresada no es válida, el número de caracteres mínimo es de 8"
        })
    }

    //Validacion de solo numeros en el telefono de contacto
    if(!validacionSoloNumeros.test(params.telefono)){
        return res.status(406).json({
            status: "error",
            message: "El número de teléfono no es válido, solo se aceptan números"
        });
    }

    //Validacion del largo del numero de contacto
    if(params.telefono.toString().length != 8){
        return res.status(406).json({
            status: "error",
            message: "El número de teléfono no es válido, solo se acepta el formato de +569-xxxxxxxx"
        })
    }
    
    //Crear objeto de usuario
    let user = new User(params);

    //Control de usuarios duplicados
    User.find({ $or: [

        {rut: user.rut},
        {email: user.email},
        {telefono: user.telefono}

    ]}).exec((error, users) => {

        //En caso de error
        if(error){
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            });
        }

        //En caso de que el usuario ya este registrado en la bd
        if(users && users.length >= 1){
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        //Cifrar la contraseña
        bcrypt.hash(user.contraseña, 10, (error, pwd) => {

            //En caso de error
            if(error){
                return res.status(500).json({
                    status: "error",
                    message: "Error en la consulta"
                });
            }

            //Contraseña cifrada
            user.contraseña = pwd;

            //Guardar datos en la BD
            user.save((error, userSave) => {

                //En caso de error
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

//Listo (admin)
const updateAuthorization = (req, res) => {

    //Se recoge id del usuario por url 
    let id = req.params.id;
    let params = req.body;

    if(!params.autorizado){
        return res.status(406).send({
            status: "error",
            message: "No se ha ingresado la nueva autorización"
        });
    }

    if(params.autorizado != "Si" && params.autorizado != "No"){
        return res.status(406).send({
            status: "error",
            message: "No se ha ingresado correctamente la nueva autorización"
        });
    }

    //Se obtiene el usuario mediante la id ingresada y se modifica su autorizacion
    User.findByIdAndUpdate(id, params, (error, user) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                status: "error",
                message: "Ha ocurrido un error al actualizar autorizacion"
            });
        }

        if(!user){
            return res.status(406).send({
                status: "error",
                message: "El usuario a modificar la autorizacion no existe"
            });
        }

        //Devolver resultado de exito
        return res.status(200).send({
            status: "success",
            message: "Se ha actualizado la autorizacion",
            user: user
        });

    });

}

//Listo (usuario)
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
    User.findOne({email: params.email})
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
            });
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

//Listo (usuario)
const viewprofile = (req, res) => {

    //Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    //Consulta para sacar los datos del usuario
    User.findById(id)
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

//Listo (admin)
const viewProfiles = (req, res) => {

    User.find()
        .select({contraseña: 0})
        .exec((error, users) => {

        if(error || !users){
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios para mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            users: users
        })

    })

}

//Listo (administrador)
const deleteUser = (req, res) => {

    //Se recoge id de usuario por url
    let id = req.params.id;

    //Se obtienen posibles reservas del usuario a eliminar
    Reserva.find({ usuario:id }, (error, reservas) => {

        //Si el usuario registra reserva no podra ser eliminado
        if(reservas.length >= 1){

            return res.status(400).send({
                status: "error",
                message: "El usuario tiene reservas registradas, no puede ser eliminado"
            });

        }

        //Se obtiene usuario por la id ingresada y se elimina
        User.findByIdAndDelete(id, (error, reserva) => {

            //En caso de error
            if(error){
                return res.status(400).send({
                    status: "error",
                    message: "Ha ocurrido un error al eliminar el usuario intentelo nuevamente"
                });
            }

            if(!reserva){
                return res.status(406).send({
                    status: "error",
                    message: "El usuario a eliminar no existe"
                });
            }

            //Devolver resultado de exito
            return res.status(200).send({
                status: "success",
                message: "El usuario se ha eliminado con exito"
            });

        });

    });

}

//Listo (usuario)
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
        User.findOneAndUpdate({_id: user_id}, {imagen: req.file.filename}, {new: true},(error, userActualizado) => {

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

//Listo (todos)
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

module.exports = {
    createUser,
    updateAuthorization,
    login,
    viewprofile,
    viewProfiles,
    deleteUser,
    subirImagen,
    conseguirImagen
}
