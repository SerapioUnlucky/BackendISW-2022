const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const reservaSchema = new Schema({
    usuario: {
        type: Schema.ObjectId,
        ref: "userModel",
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
})

module.exports = mongoose.model('reserva', reservaSchema);