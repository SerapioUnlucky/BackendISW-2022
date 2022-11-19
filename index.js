const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors());

const rutas_user = require("./routes/userRoute");
const rutas_admin = require("./routes/adminRoute");
const rutas_mail = require("./routes/mailRoute");
const rutas_reserva = require("./routes/reservaRoutes");
const rutas_informe = require("./routes/informeRoutes");

app.use("/api", rutas_user);
app.use("/api", rutas_admin);
app.use("/api", rutas_mail);
app.use("/api", rutas_reserva);
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