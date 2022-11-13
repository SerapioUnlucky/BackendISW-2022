const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors());

const rutas_users = require("./routes/usersRoute");
const rutas_admin = require("./routes/adminRoute");
const rutas_mail = require("./routes/mailRoute");

//Rutas de Samuel
const rutas_reservar = require("./routes/reservarRoutes");
const rutas_informe = require("./routes/informeRoutes");

//Rutas Marcelo
const rutas_modificar = require("./routes/editRRoute");

app.use("/api", rutas_users);
app.use("/api", rutas_admin);
app.use("/api", rutas_mail);

//Marcelo
app.use("/api", rutas_modificar);

//Samuel
app.use("/api", rutas_reservar);
app.use("/api", rutas_informe);

const options = {
    useNewUrlParser: true,
    autoIndex: true,
    keepAlive: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    useUnifiedTopology: true
}

mongoose.connect(process.env.DB, options, function (error) {
    if(error){
        console.log(error);
    }
    console.log("Se ha conectado correctamente");
});

app.listen(process.env.PORT, () => {
    console.log("El servidor se esta ejecutando en el puerto "+process.env.PORT);
});

module.exports = app;