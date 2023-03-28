const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')


const buscarPasosReceta = async (req, res) => {
    const { id } = req.params
    let sql = `select * from paso p, receta r where r.id=p.idReceta and  r.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const crearPaso = async (req, res) => {
    const { paso,orden } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const { id } = req.params

    let sql = `insert into paso(idReceta,paso,orden) values('${id}','${paso}','${orden}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'alimento guardado en la receta' })
        }
    })
}

module.exports={
    buscarPasosReceta,crearPaso
}