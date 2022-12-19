const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const reservaSchema = new Schema({
    usuario: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    fechaReserva: {
        type: Date,
        required: true
    },
    tipo: {
        type: String,
        enum: ['Lavadora','Secadora'],
        required: true
    }
},
{
    timestamps:true
})

module.exports = mongoose.model('reserva', reservaSchema);