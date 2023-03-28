const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')


const buscarComentariosPublicacion = async (req, res) => {
    const { id } = req.params//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `select u.username as usernameUsuario,u.fotoRuta,c.idUsuario,c.comentario from comentario c, publicacion p, usuario u where u.id=c.idUsuario and p.id=c.idPublicacion and p.id='${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const crearComentario = async (req, res) => {
    const { idUsuario, comentario } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const { id } = req.params

    let sql = `insert into comentario(idPublicacion, idUsuario,comentario) values('${id}','${idUsuario}','${comentario}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'comentario guardado con exito' })
        }
    })
}


const actualizarComentario = async (req, res) => {
    const { id, idComentario } = req.params


    const { comentario } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto

    let sql = `update comentario set 
              comentario ='${comentario}'
              
             
              where id= '${idComentario}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'comentario modificado' })
        }
    })
}


module.exports={
    buscarComentariosPublicacion,crearComentario,actualizarComentario
}