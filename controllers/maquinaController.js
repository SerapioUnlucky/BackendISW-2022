const maquina =require('../models/maquina')

//Listo
const crearMaquina = (req, res) => {

    const params = req.body;

    if(!params.serial || !params.tipo){
        return res.status(406).send({
            message: "Faltan datos por enviar"
        });
    }

    let newMaquina = new maquina(params);

    newMaquina.save((error, maquina) => {

        if(error){
            return res.status(400).send({
                message: "Hubo un error al guardar la maquina"
            });
        }

        return res.status(200).send({
            message: "Se registro correctamente la nueva maquina",
            maquina: maquina
        });

    });

}

//Listo
const eliminarMaquina = (req, res) => {

    let id = req.params.id;

    maquina.findByIdAndDelete(id, (error, maquina) => {

        if(error){
            return res.status(400).send({
                message: "Hubo un error al eliminar la maquina"
            });
        }

        return res.status(200).send({
            message: "Se elimino la maquina correctamente",
            maquina: maquina
        });

    });
        
}

//Listo
const modificarSerialMaquina = (req, res) => {

    let id = req.params.id;
    const serial = req.body;

    maquina.findByIdAndUpdate(id, serial, (error, maquina) => {

        if(error){
            return res.status(400).send({
                message: "Hubo un error al modificar la maquina"
            });
        }

        return res.status(200).send({
            message: "Se modifico correctamente la maquina",
            maquina: maquina
        });

    });

}

//Listo
const obtenerMaquinas = (req, res) => {
    
    maquina.find((error, maquinas) => {
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las maquinas"
            });
        }

        return res.status(200).send({
            message: "Maquinas encontradas",
            maquinas: maquinas
        });

    });

}

//Listo
const obtenerLavadoras = (req, res) => {
    
    maquina.find({tipo:"Lavadora"}, (error,lavadoras) => {
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las lavadoras"
            });
        }

        return res.status(200).send({
            message: "Lavadoras encontradas",
            lavadoras: lavadoras
        });

    });

}

//Listo
const obtenerSecadoras = (req, res) => {
    
    maquina.find({tipo:"Secadora"}, (error, secadoras) => {
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir las secadoras"
            });
        }

        return res.status(200).send({
            message: "Secadoras encontradas",
            secadoras: secadoras
        });

    });

}

//Listo
const obtenerMaquina = (req, res) => {
    
    let id = req.params.id;

    maquina.findById(id, (error, maquina) => {
        
        if(error){
            return res.status(400).send({
                message: "Hubo un error al conseguir la maquina"
            });
        }

        return res.status(200).send({
            message: "Maquina encontrada",
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
