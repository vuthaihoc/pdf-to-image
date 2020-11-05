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
  var position_data = JSON.parse(position_json);
  const position_result = await convert({ mimeType: 'image/png' , pageNumber: null, scale: 2, source: { url }, position_list: position_data })
  const convert_image = await position_result.map(item => resizeImage(item))
  return await Promise.all(convert_image)
}



const routes = {
  index: (req, res) => {
    res.sendFile(__dirname + '/index.html')
  },

  convert: (req, res, next) => { 
    let url = req.query.url
    let position_list = req.query.position_list
    if (req.method === 'POST') {
      url = req.body.url
      position_list = req.body.position_list
    }

    convertPdfToBase64(url, position_list)
      .then(function (result) {
        res.json(result)
      })
      .catch(function (err) {
        if(err instanceof TypeError){
          res.status(400).send('invalid position_list, see readme file for correct example ')
        } else{
          res.status(400).send('error rendering image: ' + err.message)
        }
      })
  },

  test: (req, res, next) => {
    const { mimeType = 'image/jpeg', pageNumber = 1, scale = 1.0, url } = req.query
    convert({
      mimeType,
      pageNumber: Number(pageNumber),
      scale: Number(scale),
      source: { url }
    }).then(buffer => {
      res.type(mimeType).send(buffer)
    }).catch(error => {
      next(error)
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

