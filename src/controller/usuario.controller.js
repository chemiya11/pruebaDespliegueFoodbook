const uploadFile = require("../middleware/upload");
const fs = require("fs");
const cloudinary = require('../middleware/cloudinary')
const baseUrl = "http://localhost:8080/files/";
const conexion = require('../../config/conexion')

const jsonwebtoken = require('jsonwebtoken');

const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const cookieParser = require('cookie-parser');


const crypto = require('crypto');
//const Securitykey = crypto.randomBytes(32);
//const Securitykey="encriptado"

const algorithm = "aes-256-cbc";
//const initVector = crypto.randomBytes(16);
//const initVector="encriptado"



const Securitykey = Buffer.alloc(32, 'prueba clave', 'ascii');
const initVector = Buffer.alloc(16, 'prueba clave', 'ascii');
console.log(Securitykey)
console.log(initVector)







const identificacion = async (req, res) => {
    const { username, password } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto

    let sql = `SELECT * FROM usuario where username= '${username}' `
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            if (rows == 0) {
                return res.json({
                    status: "usuario y contrasena incorrectos"
                })
            } else {
                let user = rows[0];


                //const isValidPassword = compareSync(password, user.password);//comprobamos la contraseñla
                var encryptIntroducida = encrypt(password)
                var isValidPassword = false;

                console.log("identifico usuario: " + encryptIntroducida)

                if (encryptIntroducida == user.password) {
                    isValidPassword = true;
                }

                if (isValidPassword) {//si es valida
                    user.password = undefined;//generamos token y lo devolvemos
                    const jsontoken = jsonwebtoken.sign({ user: user }, "secret_key", { expiresIn: '30m' });
                    res.cookie('token', jsontoken, { httpOnly: true, secure: true, SameSite: 'strict', expires: new Date(Number(new Date()) + 30 * 60 * 1000) }); //we add secure: true, when using https.


                    res.json({ token: jsontoken, id: user.id, username: username, rol: user.rol });//creamos la cooki y devolvemos json
                    //return res.redirect('/mainpage') ;

                } else {
                    return res.json({
                        status: "usuario y contrasena incorrectos"
                    });
                }
            }
        }

    })

}


const registro = async (req, res) => {
    const { username, email } = req.body//cojo el body que m ellega y lo inserto y devuelvo texto
    let password = req.body.password;
    /*let sql = `insert into usuario(username,password,fotoperfil) values('${username}','${password}','${fotoPerfil}')`
    conexion.query(sql, (err, rows, fields)=>{
        if(err) throw err
        else{
            res.json({status: 'receta agregada'})
        }
    })*/

    /*const salt = genSaltSync(10);
    password = hashSync(password, salt);*/
    /*var passwordEnc=encrypt(password);
    console.log(passwordEnc)
    var desencryt=decrypt(passwordEnc)
    console.log(desencryt)*/

    password = encrypt(password);
    console.log("registro usuario: " + password)



    let sql = `insert into usuario(username,descripcion,password,email,rol,fotoRuta) values('${username}','Hola! Este mi perfil de FoodBook, aqui publico todas las recetas deliciosas que preparo y los beneficios que me han proporcionado muchos alimentos','${password}','${email}',"user","https://res.cloudinary.com/chemareact/image/upload/v1676929586/Images/generico_ox5yja.png")`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        const user = (rows.insertId)


        const jsontoken = jsonwebtoken.sign({ user: user }, "secret_key", { expiresIn: '30m' });///generamos token
        res.cookie('token', jsontoken, { httpOnly: true, secure: true, SameSite: 'strict', expires: new Date(Number(new Date()) + 30 * 60 * 1000) }); //we add secure: true, when using https.


        let sql = `SELECT u.id,u.username FROM usuario u where u.id='${user}';`//hago select de todos
        conexion.query(sql, (err, rows, fields) => {
            if (err) throw err;
            else {
                return res.json({ status: "usuario registrado con exito" });
            }
        })

        //res.json({ token: jsontoken, user: user });
    })

}

const buscarUsuarioPorId = async (req, res) => {
    const { id } = req.params//cojo el id que me lega y hago select con el y devuelvo en json
    let sql = 'select * from usuario where id = ?'
    conexion.query(sql, [id], (err, rows, fields) => {
        if (err) throw err;
        else {
            rows[0].password = decrypt(rows[0].password)
            res.json(rows)
            console.log("busco usuario por id:" + rows[0].password)

        }
    })
}

const actualizarUsuario = async (req, res) => {
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
        const { password, email, descripcion } = req.body//cojo los campos y el id que me llega y hago actualizaciony devuelvo texto
    
        
    
    
        var passwordEnc = encrypt(password)
        console.log("actualizo usuario: " + passwordEnc)


        if(foto==true){
            sql = `update usuario set 
            password ='${passwordEnc}',
            descripcion='${descripcion}',
            email='${email}',
            fotoRuta='${newPath.url}'
           
            where id= '${id}'`

        }else {
            sql = `update usuario set 
                  password ='${passwordEnc}',
                  descripcion='${descripcion}',
                  email='${email}'
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
};



const buscarUsuarios = async (req, res) => {
    let sql;
    const { nombre } = req.query
    if (nombre == null) {
        sql = `select u.id, u.username, u.email, u.rol from usuario u  `//hago select de todos
    } else {
        sql = `select u.id, u.username, (select count(*)  from usuario u2, usuario u3, seguidor s where u2.id=s.idSeguido and s.idSeguidor=u3.id and u2.id=u.id) as seguidores,u.descripcion,u.fotoRuta from usuario u where u.username like '%${nombre}%' `//hago select de todos
    }

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            res.json(rows)//devuelvo el resultado en json
        }
    })
}


const comprobarRepetido = async (req, res) => {
    let sql;
    const { username } = req.query
    const { email } = req.query
    if (username == null) {
        sql = `select * from usuario u where u.email='${email}'  `//busco con el email
    } else {
        sql = `select * from usuario u where u.username='${username}' `//busco con username
    }

    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err;
        else {
            if (rows.length > 0) {
                res.json({ status: 'encontrado' })
            } else {
                res.json({ status: 'valido' })
            }
        }
    })
}


const eliminarUsuario = async (req, res) => {
    const { id } = req.params//cojo el id y hago consulta para borrarlo, devuelvo texto

    let sql = `delete from usuario r where r.id = '${id}'`
    conexion.query(sql, (err, rows, fields) => {
        if (err) throw err
        else {
            res.json({ status: 'receta eliminada ' })
        }
    })
}


function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData
}

// Decrypting text
function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
    let decryptedData = decipher.update(text, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData
}


module.exports = {
    actualizarUsuario, registro, identificacion, buscarUsuarioPorId, buscarUsuarios, eliminarUsuario, comprobarRepetido
}