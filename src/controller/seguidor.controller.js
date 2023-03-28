const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')

const buscarNumeroSeguidos = async (req, res) => {
    const { id } = req.params
    let sql = `select count(*) as seguidos from usuario u, usuario u1, seguidor s where u.id=s.idSeguidor and s.idSeguido=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const buscarNumeroSeguidores = async (req, res) => {
    const { id } = req.params
    let sql = `select count(*) as seguidores from usuario u, usuario u1, seguidor s where u.id=s.idSeguido and s.idSeguidor=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const buscarSeguidoresUsuario = async (req, res) => {
    const { id } = req.params
    let sql = `select u1.id, u1.username,u1.fotoRuta,u1.descripcion, (select count(*)  from usuario u2, usuario u3, seguidor s where u2.id=s.idSeguido and s.idSeguidor=u3.id and u2.id=u1.id) as seguidores from usuario u, usuario u1, seguidor s where u.id=s.idSeguido and s.idSeguidor=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const buscarSeguidosUsuario = async (req, res) => {
    const { id } = req.params
    let sql = `select  s.idSeguido as id, u1.username, u1.descripcion, u1.fotoRuta , (select count(*)  from usuario u2, usuario u3, seguidor s where u2.id=s.idSeguido and s.idSeguidor=u3.id and u2.id=u1.id) as seguidores from usuario u, usuario u1, seguidor s where u.id=s.idSeguidor and s.idSeguido=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const eliminarSeguidoUsuario = async (req, res) => {
    const { id, idSeguido } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from seguidor s where s.idSeguidor = '${id}' and s.idSeguido='${idSeguido}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'has dejado de seguir al usuario' })
        }
    })
}


const comprobarSeguido = async (req, res) => {
    const { idUsuario, idSeguido } = req.params
    let sql = `SELECT * FROM  seguidor s where s.idSeguidor='${idUsuario}' and s.idSeguido='${idSeguido}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

}


const seguirUsuario = async (req, res) => {
    const { id } = req.params
    const { idSeguido } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into seguidor(idSeguido,idSeguidor) values('${idSeguido}','${id}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'has comenzado a seguir al usuario' })
        }
    })
}

module.exports={
    eliminarSeguidoUsuario,seguirUsuario,buscarNumeroSeguidores,buscarNumeroSeguidos,buscarSeguidoresUsuario,buscarSeguidosUsuario,comprobarSeguido
}