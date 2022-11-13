const { min } = require('moment');
const mongoose  = require('mongoose');
const Schema = mongoose.Schema;
const reservaSchema = new Schema({
    usuario: {
        type: Schema.ObjectId,
        ref: "userModel",
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    day: {
        type: Number,
        required: true,
        min: 1,
        max: 31
    },
    tipo: {
        type: String,
        enum: ['lavadora','secadora'],
        required: true
    },
    hora: {
        type: Number,
        required: true,
        min: 0,
        max: 23
    },
})

module.exports = mongoose.model('reserva', reservaSchema);