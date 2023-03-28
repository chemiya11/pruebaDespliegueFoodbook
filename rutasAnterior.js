const router = require('express').Router()
const conexion = require('./config/conexion')
const jsonwebtoken = require('jsonwebtoken');

const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const cookieParser = require('cookie-parser');




//npm install --save jsonwebtoken bcrypt cookie-parser



//******************************************************LIMPIO************************************************** */





router.get('/usuarios/:id', (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = 'select * from usuario where id = ?'
    conexion.query(sql, [id], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})


router.post('/usuarios/identificacion', (req, res) => {
    const { username, password } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `SELECT * FROM usuario where username= '${username}' `
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            if (rows==0) {
                return res.json({
                    message: "usuario y contrasena incorrectos"
                })
            } else {
                let user=rows[0];
                
              
                const isValidPassword = compareSync(password, user.password);//comprobamos la contraseñla
                if (isValidPassword) {//si es valida
                    user.password = undefined;//generamos token y lo devolvemos
                    const jsontoken = jsonwebtoken.sign({ user: user }, "secret_key", { expiresIn: '30m' });
                    res.cookie('token', jsontoken, { httpOnly: true, secure: true, SameSite: 'strict', expires: new Date(Number(new Date()) + 30 * 60 * 1000) }); //we add secure: true, when using https.

                  
                    res.json({ token: jsontoken, id:user.id,username:username,rol:user.rol });//creamos la cooki y devolvemos json
                    //return res.redirect('/mainpage') ;

                } else {
                    return res.json({
                        message: "usuario y contrasena incorrectos"
                    });
                }
            }
        }


    })

})

//modificar
router.put('/usuarios/:id', (req, res) => {
    const { id } = req.params
    const { password,email } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto
   
    let sql = `update usuario set 
                password ='${password}',
                
                email='${email}'
               
                where id= '${id}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'usuario modificado' })
        }
    })

})

router.post('/usuarios/registro', (req, res) => {
    const { username, fotoPerfil,email } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    let password = req.body.password;
    /*let sql = `insert into usuario(username,password,fotoperfil) values('${username}','${password}','${fotoPerfil}')`
    conexion.query(sql, (err, rows, fields)=>{
        if(err) throw err
        else{
            res.json({status: 'receta agregada'})
        }
    })*/

    const salt = genSaltSync(10);
    password = hashSync(password, salt);

    let sql = `insert into usuario(username,password,email,rol) values('${username}','${password}','${email}',"user")`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        const user = (rows.insertId)


        const jsontoken = jsonwebtoken.sign({ user: user }, "secret_key", { expiresIn: '30m' });///generamos token
        res.cookie('token', jsontoken, { httpOnly: true, secure: true, SameSite: 'strict', expires: new Date(Number(new Date()) + 30 * 60 * 1000) }); //we add secure: true, when using https.


        let sql = `SELECT u.id,u.username FROM usuario u where u.id='${user}';`//hago select de todos
        conexion.query(sql, (err, rows, fields) => {
            if (err) throw err;
            else {
                res.json({ token: jsontoken, id:rows[0].id,username:rows[0].username });
            }
        })

        //res.json({ token: jsontoken, user: user });
    })


})


router.get('/usuarios/:id/favoritas', (req, res) => {
    const { id } = req.params
    let sql = `SELECT r.id ,r.titulo,r.tiempo,u1.username FROM receta r, usuario u,usuario u1, favorita f where u.id=f.idUsuario and f.idReceta=r.id and u1.id=r.idCreador and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:idUsuario/favoritas/:idReceta', (req, res) => {
    const { idUsuario,idReceta } = req.params
    let sql = `SELECT * FROM  favorita f where f.idUsuario='${idUsuario}' and f.idReceta='${idReceta}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:idUsuario/seguidos/:idSeguido', (req, res) => {
    const { idUsuario,idSeguido } = req.params
    let sql = `SELECT * FROM  seguidor s where s.idSeguidor='${idUsuario}' and s.idSeguido='${idSeguido}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:id/publicaciones', (req, res) => {
    const { id } = req.params
    let sql = `select p.id,p.idReceta,p.idCreador, p.titulo,u.username,r.titulo as receta from publicacion p, usuario u, receta r where p.idCreador=u.id and r.id=p.idReceta and  u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/recetas/:id/publicaciones', (req, res) => {
    const { id } = req.params
    let sql = `select p.id,p.idReceta,p.idCreador, p.titulo,u.username,r.titulo as receta from publicacion p, usuario u, receta r where p.idCreador=u.id and r.id=p.idReceta and  r.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})


router.get('/alimentos/:id/publicaciones', (req, res) => {
    const { id } = req.params
    let sql = `select p.id,p.idReceta,p.idCreador, p.titulo,u.username,a.nombre as alimento from publicacion p, usuario u, alimento a where p.idCreador=u.id and a.id=p.idAlimento and  a.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})


router.get('/publicaciones/seguidos/:id', (req, res) => {
    const { id } = req.params
    let sql = `select p.id,p.idReceta,p.idCreador, p.titulo,u.username,r.titulo as receta from publicacion p, usuario u, receta r where p.idCreador in (select s.idSeguido from seguidor s where s.idSeguidor='${id}') and p.idCreador=u.id and p.idReceta=r.id order by p.fechapublicacion;`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})


router.get('/publicaciones', (req, res) => {
    
    let sql = `SELECT p.id, p.titulo, p.fechapublicacion,u.username,r.titulo as receta FROM publicacion p,usuario u,receta r where p.idCreador=u.id and p.idReceta=r.id ;`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
           
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.post('/usuarios/:id/favoritas', (req, res) => {

    const { id } = req.params
    const { idReceta } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into favorita(idReceta,idUsuario) values('${idReceta}','${id}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta agregada a favoritas' })
        }
    })
})

router.delete('/usuarios/:id/favoritas/:idFavorita', (req, res) => {
    const { id, idFavorita } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from favorita f where f.idUsuario = '${id}' and f.idReceta='${idFavorita}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada de favoritas' })
        }
    })
});

router.delete('/recetas/:id', (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from receta r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
});

router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from usuario r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
});

router.delete('/publicaciones/:id', (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from publicacion r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
});


router.delete('/alimentos/:id', (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from alimento r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
});

router.delete('/usuarios/:id/seguidos/:idSeguido', (req, res) => {
    const { id, idSeguido } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from seguidor s where s.idSeguidor = '${id}' and s.idSeguido='${idSeguido}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'has dejado de seguir al usuario' })
        }
    })
});

router.post('/usuarios/:id/seguidos', (req, res) => {
    const { id } = req.params
    const { idSeguido } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into seguidor(idSeguido,idSeguidor) values('${idSeguido}','${id}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'has comenzado a seguir al usuario' })
        }
    })
})


router.get('/usuarios/:id/seguidos', (req, res) => {
    const { id } = req.params
    let sql = `select  s.idSeguido,s.idSeguidor, u1.username from usuario u, usuario u1, seguidor s where u.id=s.idSeguidor and s.idSeguido=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:id/misPublicaciones', (req, res) => {
    const { id } = req.params
    let sql = `select p.id, p.titulo, r.titulo as receta, u.username from publicacion p, usuario u,receta r where p.idReceta=r.id and u.id=p.idCreador and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:id/numeroSeguidos', (req, res) => {
    const { id } = req.params
    let sql = `select count(*) as seguidos from usuario u, usuario u1, seguidor s where u.id=s.idSeguidor and s.idSeguido=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:id/seguidores', (req, res) => {
    const { id } = req.params
    let sql = `select u1.id, u1.username from usuario u, usuario u1, seguidor s where u.id=s.idSeguido and s.idSeguidor=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios/:id/numeroSeguidores', (req, res) => {
    const { id } = req.params
    let sql = `select count(*) as seguidores from usuario u, usuario u1, seguidor s where u.id=s.idSeguido and s.idSeguidor=u1.id and u.id='${id}';`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})


//get equipos


router.get('/recetas', (req, res) => {
    let sql;
    const { titulo } = req.query
    if(titulo==null){
        sql = `select r.id, r.titulo, u.username, r.tiempo from receta r,usuario u where r.idCreador=u.id  `//hago select de todos
    }else{
        sql = `select r.id, r.titulo, u.username, r.tiempo from receta r,usuario u where r.idCreador=u.id and r.titulo like '%${titulo}%' `//hago select de todos
    }
  
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})




router.get('/alimentos', (req, res) => {
    let sql;
    const { nombre } = req.query
    if(nombre==null){
        sql = `select a.id, a.nombre, a.descripcion, a.calorias from alimento a  `//hago select de todos
    }else{
        sql = `select a.id, a.nombre, a.descripcion, a.calorias from alimento a where a.nombre like '%${nombre}%' `//hago select de todos
    }
    
   
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/usuarios', (req, res) => {
    let sql;
    const { nombre } = req.query
    if(nombre==null){
        sql = `select u.id, u.username, u.email, u.rol from usuario u  `//hago select de todos
    }else{
        sql = `select u.id, u.username, (select count(*)  from usuario u2, usuario u3, seguidor s where u2.id=s.idSeguido and s.idSeguidor=u3.id and u2.id=u.id) as seguidores from usuario u where u.username like '%${nombre}%' `//hago select de todos
    }
  
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

// get un equipo
router.get('/recetas/:id', (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = `select r.id, r.titulo, r.resumen, r.pasos,r.tiempo, u.username, r.idCreador from receta r, usuario u where r.idCreador=u.id and r.id= '${id}' `//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
})


//agregar equipo
router.post('/recetas', (req, res) => {
    const { titulo, resumen, pasos, tiempo, idCreador } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into receta(titulo, resumen, pasos, tiempo, idCreador) values('${titulo}','${resumen}','${pasos}','${tiempo}','${idCreador}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            
            res.json({ id:rows.insertId })
        }
    })
})





//modificar
router.put('/recetas/:id', (req, res) => {
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

})


router.put('/alimentos/:id', (req, res) => {
    const { id } = req.params
    const { nombre,descripcion,calorias } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto


  
    let sql = `update alimento set 
                nombre ='${nombre}',
                descripcion='${descripcion}',
                calorias='${calorias}'
                
                where id= '${id}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            
            res.json({ status: 'receta modificada' })
        }
    })

})


router.get('/publicaciones', (req, res) => {
    let sql = 'select p.id, u.username,p.titulo, r.titulo as receta, p.descripcion, p.fechapublicacion from publicacion p, receta r, usuario u where p.idCreador=u.id and p.idReceta=r.id'//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.post('/publicaciones', (req, res) => {
    const { titulo, descripcion,  idCreador,idAlimento,idReceta } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const fechapublicacion = "2020-01-01"
    let sql="";
    if(idAlimento==0){
        sql = `insert into publicacion(titulo,descripcion,fechapublicacion,idCreador,idReceta) values('${titulo}','${descripcion}','${fechapublicacion}','${idCreador}','${idReceta}')`
   }else{
     sql = `insert into publicacion(titulo,descripcion,fechapublicacion,idCreador,idAlimento) values('${titulo}','${descripcion}','${fechapublicacion}','${idCreador}','${idAlimento}')`
   }

   
   
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'publicacion guardada con exito' })
        }
    })
})

router.post('/recetas/:id/alimentosRecetas', (req, res) => {
    const { idAlimento, cantidad } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const { id } = req.params
    
    let sql = `insert into alimentoReceta(idAlimento,idReceta,cantidad) values('${idAlimento}','${id}','${cantidad}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'alimento guardado en la receta' })
        }
    })
})

router.get('/publicaciones/:id', (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = `select p.id, p.titulo, p.descripcion, p.fechapublicacion, u.username, r.titulo as receta, p.idCreador, p.idReceta  from publicacion p, usuario u, receta r where p.idCreador=u.id and p.idReceta=r.id and p.id= '${id}' `//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
})


router.put('/publicaciones/:id', (req, res) => {
    const { id } = req.params
    const { descripcion, titulo } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto

    let sql = `update publicacion set 
                descripcion ='${descripcion}',
                titulo='${titulo}'
               
                where id= '${id}'`

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'publicacion modificada' })
        }
    })

})


router.get('/alimentos', (req, res) => {
    let sql = 'select * from alimento'//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.get('/recetas/:id/alimentosRecetas', (req, res) => {
    const { id } = req.params
    let sql = `select a.nombre as alimento, ar.cantidad, ar.idAlimento from alimento a, receta r, alimentoReceta ar where r.id=ar.idReceta and ar.idAlimento=a.id and r.id='${id}'`//hago select de todos
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})


router.get('/alimentos/:id', (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = 'select * from alimento where id = ?'
    conexion.query(sql, [id], (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)
        }
    })
})


router.post('/alimentos', function(req, res){
    console.log(req)
    controller.uploadAlimento
  });

/*router.post('/alimentos', (req, res) => {








    const { nombre, descripcion, calorias } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `insert into alimento(nombre,descripcion,calorias) values('${nombre}','${descripcion}','${calorias}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'alimento guardado' })
        }
    })





})*/

router.get('/publicaciones/:id/comentarios', (req, res) => {
    const { id } = req.params//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `select u.username,c.idUsuario,c.comentario from comentario c, publicacion p, usuario u where u.id=c.idUsuario and p.id=c.idPublicacion and p.id='${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })

})

router.post('/publicaciones/:id/comentarios', (req, res) => {
    const { idUsuario, comentario } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    const { id } = req.params
  
    let sql = `insert into comentario(idPublicacion, idUsuario,comentario) values('${id}','${idUsuario}','${comentario}')`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'comentario guardado con exito' })
        }
    })
})


router.put('/publicaciones/:id/comentarios/:idComentario', (req, res) => {
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

})






//******************************************************LIMPIO************************************************** */



































//agregar equipo

















//********************************************************** */



//---------- agregamos rutas--------







//---------------------------------------------------------------------------------------------------------








//-------------------------------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------------------------------







module.exports = router