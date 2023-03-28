const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')


const buscarFavoritas = async (req, res) => {
    const { id } = req.params
    let sql = `SELECT r.id ,r.titulo,r.tiempo,u1.username as usernameUsuario,u.fotoRuta as fotoCreador,r.dificultad, r.fotoRuta FROM receta r, usuario u,usuario u1, favorita f where u.id=f.idUsuario and f.idReceta=r.id and u1.id=r.idCreador and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const eliminarFavorita = async (req, res) => {
    const { id, idFavorita } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from favorita f where f.idUsuario = '${id}' and f.idReceta='${idFavorita}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada de favoritas' })
        }
    })
}


const crearFavorita = async (req, res) => {
    const { id } = req.params
    const { idReceta } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into favorita(idReceta,idUsuario) values('${idReceta}','${id}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta agregada a favoritas' })
        }
    })
}

const comprobarFavorita = async (req, res) => {
    const { idUsuario, idReceta } = req.params
    let sql = `SELECT * FROM  favorita f where f.idUsuario='${idUsuario}' and f.idReceta='${idReceta}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

}

module.exports={
    buscarFavoritas,comprobarFavorita,eliminarFavorita,crearFavorita
}
