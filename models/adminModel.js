const { Schema, model } = require("mongoose");

const AdminSchema = Schema({
    email:{
        type: String,
        required: true,
        uniqued: true
    },
    contraseña:{
        type: String,
        required: true
    }
});

module.exports = model("Admin", AdminSchema);