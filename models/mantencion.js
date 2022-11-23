const { min } = require('moment');
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const mantencionSchema = new Schema({
    fechaIni:{
        type: Date,
        required: true
    },
    fechaFin:{
        type: Date,
        requided: true
    },
    maquinaid:{
        type: Schema.ObjectId,
        ref: "maquina",
        required: true
    },
    tipo:{
        type: String,
        enum: ['Lavadora','Secadora'],
        required: true
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model('mantencion', mantencionSchema);