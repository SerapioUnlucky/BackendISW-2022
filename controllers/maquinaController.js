const maquina = require('../models/maquina');
const reserva = require("../models/reservaModel");

//Listo
const crearMaquina = (req, res) => {

    //Conseguir parametros del body
    let params = req.body;

    //Validacion de si se reciben datos
    if(!params.serial || !params.tipo){
        return res.status(406).send({
            message: "Faltan datos por enviar"
        });
    }

    //Creacion del objeto
    let newMaquina = new maquina(params);

    //Se obtiene la posible maquina que ya tiene el serial ingresado
    maquina.exists({serial: params.serial}, (error, seriales) => {

        //En caso de que si este la maquina con el serial
        if(seriales){
            return res.status(400).send({
                status: "error",
                message: "Ya existe una máquina con el serial ingresado"
            });
        }

        //Procede a guardar la nueva maquina
        newMaquina.save((error, maquina) => {

            //En caso de error
            if(error){
                return res.status(400).send({
                    message: "Hubo un error al guardar la máquina"
                });
            }

            //Devuelve resultado exitoso de creacion de maquina
            return res.status(200).send({
                message: "Se registró correctamente la nueva máquina",
                maquina: maquina
            });

        });
        
    });

}

//Listo
const eliminarMaquina = (req, res) => {

    let id = req.params.id;

    //Buscar el tipo de maquina que se quiere eliminar
    maquina.findById(id, (error, tipoMaquina) => {

        if(!tipoMaquina){
            return res.status(406).send({
                status: "error",
                message: "La máquina a eliminar no existe"
            });
        }

        //Buscar cuantas reservas estan con esa maquina en concreto
        reserva.find({tipo: tipoMaquina.tipo}, (error, reservaMaquinas) => {

            //Buscar la cantidad total del tipo de maquina que se quiere eliminar
            maquina.find({tipo: tipoMaquina.tipo}, (error, maquinas) => {

                //Condicion de si estan todas las maquinas reservadas no puede ser eliminado
                if(reservaMaquinas.length >= maquinas.length){
                    return res.status(400).send({
                        status: "error",
                        message: "El tipo de máquina que desea eliminar están todas reservadas por ende no puede ser eliminado"
                    });
                }

                //Procede a la eliminacion de la maquina
                maquina.findByIdAndDelete(id, (error, maquina) => {

                    //En caso de error
                    if(error){
                        return res.status(400).send({
                            message: "Hubo un error al eliminar la máquina"
                        });
                    }
            
                    //Devuelve un resultado exitoso de eliminacion
                    return res.status(200).send({
                        message: "Se eliminó la máquina correctamente",
                        maquina: maquina
                    });
            
                });

            });

        });

    });
        
}

//Listo
const modificarSerialMaquina = (req, res) => {

    //Se reciben los parametros
    let id = req.params.id;
    let params = req.body;

    //Validacion de si se obtiene el serial
    if(!params.serial){
        return res.status(406).send({
            status: "error",
            message: "No se ingresó el serial para modificar"
        });
    }

    //Se obtiene la posible maquina que ya tiene el serial ingresado
    maquina.exists({serial: params.serial}, (error, seriales) => {

        //En caso de que si este la maquina con el serial
        if(seriales){
            return res.status(400).send({
                status: "error",
                message: "Ya existe una máquina con el serial ingresado"
            });
        }

        //Buscar por la id la maquina que se desea modificar el serial
        maquina.findByIdAndUpdate(id, params, (error, maquina) => {

            //En caso de error
            if(error){
                return res.status(400).send({
                    message: "Hubo un error al modificar la máquina"
                });
            }

            //En caso que la maquina no exista
            if(!maquina){
                return res.status(406).send({
                    status: "error",
                    message: "No existe la máquina que se quiere modificar la serial"
                });
            }

            //Devuelve resultado exitoso de modificacion
            return res.status(200).send({
                message: "Se modificó correctamente la máquina",
                maquina: maquina
            });

        });
    
    });

}

//Listo
const obtenerMaquinas = (req, res) => {
    
    //Se obtienen todas las maquinas
    maquina.find((error, maquinas) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las máquinas"
            });
        }

        //En caso de que no hayan maquinas para mostrar
        if(maquinas.length == 0){
            return res.status(406).send({
                status: "error",
                message: "No se han encontrado máquinas"
            });
        }

        //Devuelve resultado exitoso de obtencion
        return res.status(200).send({
            message: "Máquinas encontradas",
            maquinas: maquinas
        });

    });

}

//Listo
const obtenerLavadoras = (req, res) => {
    
    //Se obtienen todas las lavadoras
    maquina.find({tipo:"Lavadora"}, (error,lavadoras) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las lavadoras"
            });
        }

        //En caso de que no hayan lavadoras para mostrar
        if(lavadoras.length == 0){
            return res.status(406).send({
                status: "error",
                message: "No se han encontrados lavadoras"
            });
        }

        //Devuelve resultado exitoso de obtencion
        return res.status(200).send({
            message: "Lavadoras encontradas",
            lavadoras: lavadoras
        });

    });

}

//Listo
const obtenerSecadoras = (req, res) => {
    
    //Se obtienen todas las secadoras
    maquina.find({tipo:"Secadora"}, (error, secadoras) => {

        //En caso de error
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las secadoras"
            });
        }

        //En caso de que no hayan secadoras para mostrar
        if(secadoras.length == 0){
            return res.status(406).send({
                status: "error",
                message: "No se han encontrados secadoras"
            });
        }

        //Devuelve resultado exitoso de obtencion
        return res.status(200).send({
            message: "Secadoras encontradas",
            secadoras: secadoras
        });

    });

}

//Listo
const obtenerMaquina = (req, res) => {
    
    //Se obtiene la id por url
    let id = req.params.id;

    //Se obtiene la maquina mediante la id recibida
    maquina.findById(id, (error, maquina) => {
        
        //En caso de error
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir la máquina"
            });
        }

        //Devuelve resultado exitoso de obtencion
        return res.status(200).send({
            message: "Máquina encontrada",
            maquina: maquina
        });

    });

}

module.exports = {
    crearMaquina,
    eliminarMaquina,
    modificarSerialMaquina,
    obtenerMaquinas,
    obtenerLavadoras,
    obtenerSecadoras,
    obtenerMaquina
}
