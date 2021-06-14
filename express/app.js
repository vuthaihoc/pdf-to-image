const express = require('express')
const convert = require('../lib/convert')
const sharp = require('sharp')
const bodyParser = require('body-parser')
const WorkQueue = require('../lib/workqueue')
const sha1 = require('sha1')

const workQueue = new WorkQueue()

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

    const queueKey = sha1(req.__domain + req.url)

    const { mimeType = 'image/jpeg', pageNumber = 1, scale = 1.0, url } = req.query

    return workQueue
    .run(queueKey, () => {
      return convert({
        mimeType,
        pageNumber: Number(pageNumber),
        scale: Number(scale),
        source: { url }
      })
    }).then(buffer => {
      res.type(mimeType).send(buffer)
    }).catch(error => {
      next(error)
    }).catch(err => {
      console.log(err)
      res.end("Error " + err.message)
    })
  }
}

const server = express()
.get('/', routes.index)
.get('/convert', routes.convert)
.listen(process.env.PORT || 8080, () => {
  const address = server.address()
  console.info(`Ready at http://localhost:${address.port}`)
})

