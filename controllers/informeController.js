const reserva = require('../models/reservaModel')
const usuario = require('../models/userModel')

//Listo
//Requerimiento de Samuel Sanhueza
const generarInforme = async (req, res) => {
    //E
    const {year,month} = req.body;

    //validadcion disponibilidad aqui

    const usos = 12; //!POR AHORA

    let fecha = new Date;
    let mes = fecha.getMonth()+1;
    let anio = fecha.getFullYear();

    if ((year>anio) || (month>=mes)){
        return res.status(406).send({message:"La fecha ingresada no es válida"})
    }
    


    usuario.find({}, function(err,users){
        if (err) throw err;
        let cuentaArray = new Array()
        users.forEach(usr => {
            let cuenta = {
                "usuario": usr,
                "cargo": 0
            }
            let auxlav = 0;
            let auxsec = 0;
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
            }
            cuenta.cargo = cuenta.cargo + (auxlav*8000);
            cuenta.cargo = cuenta.cargo + (auxsec*6000);
            //console.log(cuenta)
            if(cuenta.cargo != 0){
                cuentaArray.push(cuenta);
            }
            if(users[users.length-1].id == usr.id)
                return res.status(200).send({message:"Lista generada",lista:cuentaArray})
            })
        });
    });
}

module.exports = {
    generarInforme
}