const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')

const buscarRecetas = async (req, res) => {
    let sql;
    const { titulo } = req.query
    if (titulo == null) {
        sql = `select r.id,r.dificultad,u.fotoRuta as fotoCreador, r.titulo, u.username as usernameUsuario, r.tiempo,r.fotoRuta from receta r,usuario u where r.idCreador=u.id  `//hago select de todos
    } else {
        sql = `select r.id,r.dificultad,u.fotoRuta as fotoCreador, r.titulo, u.username usernameUsuario, r.tiempo, r.fotoRuta from receta r,usuario u where r.idCreador=u.id and r.titulo like '%${titulo}%' `//hago select de todos
    }

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

}


const buscarRecetaPorId = async (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = `select r.id, r.titulo,u.fotoRuta as fotoCreador, r.resumen,r.tiempo, u.username as usernameUsuario, r.idCreador, r.fotoRuta from receta r, usuario u where r.idCreador=u.id and r.id= '${id}' `//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}

const crearReceta = async (req, res) => {
    try {
  
   
      await uploadFile(req, res);//llam a multer para guardarlo
   
  
  //console.log("----------------------------")
  //console.log(req)//vody tiene el nombre y debajo file
      if (req.file == undefined) {//error sin imagen
        return res.status(400).send({ message: "Please upload a file!" });
      }
  
  
  
      const path="images/"+req.file.originalname;
    
        
        const newPath =  await cloudinary.uploads(path, 'Images');//llamo al cloudinary para que lo suba
        //console.log("ruta cloudinary:"+newPath.url)//me devuelvo lo de cloudinaru
       
      
  
        const { titulo, resumen,  tiempo, idCreador,dificultad } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
  
        let sql = `insert into receta(titulo, resumen,  tiempo, idCreador,fotoRuta,dificultad) values('${titulo}','${resumen}','${tiempo}','${idCreador}','${newPath.url}','${dificultad}')`
        conexion.query(sql, (err, rows, fields) => {
            if (err) throw err
            else {
           
              res.status(200).send({ id: rows.insertId })
            }
        })
  
  
  
  
  
  
  
    
    } catch (err) {
      console.log(err);
  
      if (err.code == "LIMIT_FILE_SIZE") {//error de tamano
        return res.status(500).send({
          message: "File size cannot be larger than 2MB!",
        });
      }
  
      res.status(500).send({//que no se pueda subir
        message: `Could not upload the file: . ${err}`,
      });
    }
  };


  const eliminarReceta = async (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from receta r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
}

const actualizarReceta = async (req, res) => {
    const { id } = req.params
    const { titulo, resumen, pasos, tiempo } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto

    let sql = `update receta set 
              titulo ='${titulo}',
              resumen='${resumen}',
              pasos='${pasos}',
              tiempo='${tiempo}'
              where id= '${id}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta modificada' })
        }
    })

}


module.exports={
    actualizarReceta,eliminarReceta,crearReceta,buscarRecetaPorId,buscarRecetas
}