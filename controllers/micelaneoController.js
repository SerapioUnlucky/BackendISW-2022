const reserva = require('../models/reservaModel');
const usuario = require('../models/userModel')

//Listo
const generarInforme = (req,res) => {

    const {fecharec} = req.body;

    //validadcion disponibilidad aqui
    const usos = 12; //!POR AHORA
    let fecha = new Date();
    fecha.setHours(0,0,0,0)
    fecha.setDate(1);

    let fechaReque = new Date(fecharec);

    fechaReque.setDate(1);
    fechaReque.setHours(0,0,0,0);

    let fechaFina = new Date(fechaReque.getTime());

    fechaFina.setHours(0,0,0,0);
    fechaFina.setMonth(fechaReque.getMonth()+1);
    fechaFina.setDate(0);

    let postpasado = new Date();
    postpasado.setMonth(postpasado.getMonth() +2);
    postpasado.setDate(0);

    if (fechaReque.getTime()>postpasado.getTime()){
        return res.status(406).send({message:"La fecha ingresada no es válida"})
    }
    
    reserva.find({fechaReserva:{"$gte":fechaReque.toJSON(),"$lte":fechaFina.toJSON()}}).populate("usuario").exec(function (err,reser) {
        if (err) throw err;

        let cuentaMap = new Map();

        reser.forEach(element => {
            if(!cuentaMap.has(element.usuario._id)){
                cuentaMap.set(element.usuario._id, {
                    "usuario": element.usuario.nombre+" "+ element.usuario.apellido,
                    "cargo": 0,
                    "sobreCargo": 0,
                    "usoLav": 0,
                    "usoSec": 0
                })
            }

            let cuenta = cuentaMap.get(element.usuario._id);

            if(element.tipo == 'Lavadora'){
                cuenta.usoLav++;
            }else{
                cuenta.usoSec++;
            }

        })

        console.log(cuentaMap);

        let cuentaArray = new Array();

        cuentaMap.forEach((value,key)=> {
            let usosnow = value.usoLav+value.usoSec;
            if(usosnow>usos){
                value.sobreCargo = (usosnow-usos)* 1000;
            }

            console.log(usosnow);
            console.log(value.sobreCargo);

            value.cargo = (value.usoLav*8000)+(value.usoSec*6000)+value.sobreCargo;
            console.log(value.cargo)
            cuentaArray.push(value);
        })
        
        console.log(cuentaArray)
        return res.status(200).send({message:"Lista generada",lista:cuentaArray});
    })
}

module.exports = {
    generarInforme
}
