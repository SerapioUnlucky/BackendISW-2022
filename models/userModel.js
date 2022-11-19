const { Schema, model } = require("mongoose");

const UserSchema = Schema({
    nombre:{
        type: String,
        required: true
    },
    apellido:{
        type: String,
        required: true
    },
    rut:{
        type: Number,
        required: true,
        uniqued: true
    },
    email:{
        type: String,
        required: true,
        uniqued: true
    },
    direccion:{
        type: String,
        required: true
    },
    fechaNacimiento:{
        type: Date,
        required: true
    },
    contraseña:{
        type: String,
        required: true
    },
    telefono:{
        type: Number,
        required: true,
        uniqued: true
    },
    imagen:{
        type: String,
        default: "default.png"
    },
    autorizado:{
        type: String,
        enum: ['Si', 'No'],
        default: 'Si'
    }
});

module.exports = model("User", UserSchema);