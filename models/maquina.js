const { min } = require('moment');
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const maquinaSchema = new Schema({
    tipo: {
        type: String,
        enum: ['Lavadora','Secadora'],
        required: true
    },
    serial:{
        type: String,
        required: true
    },
    fechaIns: {
        type: Date,
        default: Date().now
    },
    
},
{
    timestamps: true
}
)

module.exports = mongoose.model('maquina', maquinaSchema);