require('./config/conexion');
const express = require('express')
const cors = require('cors')
const port = ( 3000)

// express
const app = express()

global.__basedir = __dirname;
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use(express.static("frontend"));

//configurar pongo el puerto escogido
app.set('port',port)

//rutas basicas
app.use('/api', require('./src/routes/index'))//acceder a localhost:3000/api


//inicializar express y escuchan en el puerto
app.listen(app.get('port'),(error)=>{
    if(error)
    {console.log('error al iniciar el servidor: '+error)}
    else{
        console.log('servidor iniciado en el prueto: '+port)
    }
})