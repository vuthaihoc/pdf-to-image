const express = require('express')
const convert = require('../lib/convert')
const sharp = require('sharp')
const bodyParser = require('body-parser')
const { MissingDataException, async } = require('pdfjs-dist/build/pdf.worker')

async function resizeImage(image){
  let base64;
  await sharp(image.buffer)
          .extract({ left: Number(image.x_top), top: Number(image.y_top), width: Number(image.x_bottom ) - Number(image.x_top), height: Number(image.y_bottom ) - Number(image.y_top) })
          .toBuffer().then(function (buf) {
            base64 = 'data:image/png;base64,' + buf.toString('base64')
          }, function(err){
            throw err
          })
  return base64;

}

async function convertPdfToBase64(url, position_list) {
  var position_json = position_list.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  position_json = position_json.replace(/'/g, '"');
  var data = JSON.parse(position_json);
  data.forEach((element, key) => {
    element.index = key
  });

  const promise_buffer = data.map(element => convert({ mimeType: 'image/png' , pageNumber: Number(element.pageNumber), scale: Number(element.scale), source: { url } }))
  const buffer_result = await Promise.all(promise_buffer)
  data.forEach((element, key) => {
    element.buffer = buffer_result[key]
  })
  
  const convert_image = await data.map(item => resizeImage(item))
  const image_result = await Promise.all(convert_image);
  return image_result
}



const routes = {
  index: (req, res) => {
    res.sendFile(__dirname + '/index.html')
  },

  convert: (req, res, next) => { 
    console.log(req.method)
    let url = req.query.url
    let scale = req.query.scale || 2.0
    let position_list = req.query.position_list
    if (req.method == 'POST') {
      url = req.body.url
      scale = req.body.scale
      position_list = req.body.position_list
    }

    convertPdfToBase64(url, position_list)
      .then(function (result) {
        res.json(result)
      })
      .catch(function (err) {
        throw err
      })
  },

  test: (req, res, next) => {

    const { pageNumber = 1, x_top = 1, y_top = 1, x_bottom = 300, y_bottom = 300, scale = 2, mimeType, url } = req.query
    convert({
      mimeType,
      pageNumber: Number(pageNumber),
      scale: Number(scale),
      source: { url }
    }).then(buffer => {
      if (x_top && x_bottom && y_bottom && y_top) {
        sharp(buffer)
          .extract({ left: Number(x_top), top: Number(y_top), width: Number(x_bottom - x_top), height: Number(y_bottom - y_top) })
          .toBuffer().then(function (buf) {
            res.type(mimeType).send(buf)
          }, function (err) {
            res.status(400).send('convert image error')
          })
      } else {
        sharp(buffer).toBuffer().then(function (buf) {
          res.type(mimeType).send(buf)
        })
      }

    }).catch(error => {
      res.status(400).send('invalid position or url')
    })
  }
}

const server = express()
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/', routes.index)
  .get('/convert', routes.convert)
  .post('/convert', routes.convert)
  .get('/test', routes.test)
  .listen(process.env.PORT || 8000, () => {
    const address = server.address()
    console.info(`Ready at http://localhost:${address.port}`)
  })

