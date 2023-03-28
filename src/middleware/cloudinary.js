const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})//configuro la conexion conc loudinary

exports.uploads = (file, folder) => {//subo el archivo que me llega
  return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) => {
      resolve({
        url: result.url,
        id: result.public_id//guardo la respuesta
      })
    }, {
      resource_type: "auto",
      folder: folder//lo guardo en la carpete
    })
  })
}