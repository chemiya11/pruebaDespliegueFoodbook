const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')




const buscarAlimentosReceta = async (req, res) => {
    const { id } = req.params
    let sql = `select a.nombre as nombreAlimento, ar.cantidad,ar.medida,a.fotoRuta, ar.idAlimento from alimento a, receta r, alimentoReceta ar where r.id=ar.idReceta and ar.idAlimento=a.id and r.id='${id}'`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const crearAlimentoReceta = async (req, res) => {
    const { idAlimento, cantidad,medida } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const { id } = req.params

    let sql = `insert into alimentoReceta(idAlimento,idReceta,cantidad,medida) values('${idAlimento}','${id}','${cantidad}','${medida}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'alimento guardado en la receta' })
        }
    })
}


module.exports={
    buscarAlimentosReceta,crearAlimentoReceta
}