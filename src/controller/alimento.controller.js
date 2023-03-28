const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')




const crearAlimento = async (req, res) => {
    try {
  
   
      await uploadFile(req, res);//llam a multer para guardarlo
   
  
  //console.log("----------------------------")
  //console.log(req)//vody tiene el nombre y debajo file
      if (req.file == undefined) {//error sin imagen
        return res.status(400).send({ message: "Please upload a file!" });
      }
  
  
  
      const path="images/"+req.file.originalname;
    
        
        const newPath =  await cloudinary.uploads(path, 'Images');//llamo al cloudinary para que lo suba
        console.log("ruta cloudinary:"+newPath.url)//me devuelvo lo de cloudinaru
       
      
  
        const { nombre, descripcion, calorias,enlace,carbohidratos,grasas,proteinas,cantidad,medida } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
  
        let sql = `insert into alimento(nombre,descripcion,calorias,fotoRuta,enlace,carbohidratos,grasas,proteinas,cantidad,medida) values('${nombre}','${descripcion}','${calorias}','${newPath.url}','${enlace}','${carbohidratos}','${grasas}','${proteinas}','${cantidad}','${medida}')`
        conexion.query(sql, (err, rows, fields) => {
            if (err) throw err
            else {
              res.status(200).send({//si se guarda correctamente
                message: "Uploaded the file successfully: " + req.file.originalname,
              });
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



  const buscarAlimentos = async (req, res) => {
    let sql;
    const { nombre } = req.query
    if (nombre == null) {
        sql = `select a.id,a.enlace,a.cantidad, a.nombre, a.descripcion, a.calorias,a.fotoRuta,a.medida from alimento a  `//hago select de todos
    } else {
        sql = `select a.id,a.enlace,a.cantidad, a.nombre, a.descripcion, a.calorias,a.fotoRuta, a.medida from alimento a where a.nombre like '%${nombre}%' `//hago select de todos
    }


    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

  }


  const buscarAlimentoPorId = async (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = 'select * from alimento where id = ?'
    conexion.query(sql, [id], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
  }


  const eliminarAlimento = async (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from alimento r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
}


const actualizarAlimento = async (req, res) => {
  var foto = true;
  let sql;
  var newPath;
  


  try {


      await uploadFile(req, res);//llam a multer para guardarlo


      //console.log("----------------------------")
      //console.log(req)//vody tiene el nombre y debajo file
      if (req.file == undefined) {//error sin imagen
          foto = false;
      }


      if (foto == true) {
          const path = "images/" + req.file.originalname;
          console.log(req.file.originalname)


          newPath = await cloudinary.uploads(path, 'Images');//llamo al cloudinary para que lo suba
          //console.log("ruta cloudinary:"+newPath.url)//me devuelvo lo de cloudinaru

          console.log(newPath.url)

          
      } 



      const { id } = req.params
      const { nombre, descripcion, calorias,enlace,grasas,carbohidratos,proteinas,cantidad,medida } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto
  
      
  
  
    


      if(foto==true){
        sql = `update alimento set 
        nombre ='${nombre}',
        descripcion='${descripcion}',
        calorias='${calorias}',
        enlace='${enlace}',
        grasas='${grasas}',
        carbohidratos='${carbohidratos}',
        proteinas='${proteinas}',
        cantidad='${cantidad}',
        medida='${medida}',
        fotoRuta='${newPath.url}'
        
        where id= '${id}'`


      }else {
        sql = `update alimento set 
        nombre ='${nombre}',
        descripcion='${descripcion}',
        calorias='${calorias}',
        enlace='${enlace}',
        grasas='${grasas}',
        carbohidratos='${carbohidratos}',
        proteinas='${proteinas}',
        cantidad='${cantidad}',
        medida='${medida}'
        
        where id= '${id}'`
      }


      conexion.query(sql, (err, rows, fields) => {
          if (err) throw err
          else {
              res.status(200).send({//si se guarda correctamente
                  message: "actualizado con exito "
              });
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













  //-----------------------------------------------


 /*   const { id } = req.params
    const { nombre, descripcion, calorias,enlace,grasas,carbohidratos,proteinas,cantidad,medida } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto



    let sql = `update alimento set 
              nombre ='${nombre}',
              descripcion='${descripcion}',
              calorias='${calorias}',
              enlace='${enlace}',
              grasas='${grasas}',
              carbohidratos='${carbohidratos}',
              proteinas='${proteinas}',
              cantidad='${cantidad}',
              medida='${medida}'
              
              where id= '${id}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {

            res.json({ status: 'receta modificada' })
        }
    })*/
}

  module.exports={
    buscarAlimentos,crearAlimento,actualizarAlimento,eliminarAlimento,buscarAlimentoPorId
  }

  