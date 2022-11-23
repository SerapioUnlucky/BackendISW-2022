const reserva = require('../models/reservaModel');
const usuario = require('../models/userModel')

const generarInforme = (req,res) => {

    const {fecharec,year,month} = req.body;

    //validadcion disponibilidad aqui
    const usos = 12; //!POR AHORA

    let fecha = new Date();
    fecha.setHours(0,0,0,0)
    fecha.setDate(1);

    let fechaReque = new Date(fecharec);
    fechaReque.setDate(1);
    fechaReque.setHours(0,0,0,0);
    let fechaFina = new Date(fechaReque.getTime())
    fechaFina.setHours(23,59,59,0)
    fechaFina.setDate(29)

    if (fechaReque.getTime()>fecha.getTime()){//!AGREGAR IGUAL "="
        return res.status(406).send({message:"la fecha ingresada no es valida"})
    }
    
    usuario.find({}, function(err,users){
        if (err) throw err;
        let cuentaArray = new Array()
        users.forEach(usr => {
            let cuenta = {
                "usuario": usr,
                "cargo": 0,
                "sobreCargo": 0,
                "usoLav": 0,
                "usoSec": 0
            }
            let auxlav = 0;
            let auxsec = 0;
            reserva.find({fechaReserva:{"$gte":fechaReque.toJSON(),"$lte":fechaFina.toJSON(),usuario:usr}})
            reserva.find({year:year,month:month,usuario:usr}, function(err,reser){
                if (err) throw err;
                reser.forEach(re => {
                    if(re.tipo == "lavadora"){
                        auxlav++;
                    }else{
                        auxsec++;
                    }
                })
            //? PREGUNTAR SI ESTA PARTE ESTA BIEN
            //! POSIBLE REESTRUCTURADO
            if ((auxlav+auxsec) > usos){
                cuenta.cargo = (auxlav+auxsec-usos)*1000;
                cuenta.sobreCargo = cuenta.cargo;
            }
            cuenta.cargo = cuenta.cargo + (auxlav*8000);
            cuenta.cargo = cuenta.cargo + (auxsec*6000);

            cuenta.usoLav = auxlav;
            cuenta.usoSec = auxsec;
            //console.log(cuenta)
            if(cuenta.cargo != 0){
                cuentaArray.push(cuenta);
            }
            if(users[users.length-1].id == usr.id)
                return res.status(200).send({message:"lista generada",lista:cuentaArray})
            })
        });
    });
}

module.exports = {
    generarInforme
}
