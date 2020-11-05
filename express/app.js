const express = require('express')
const convert = require('../lib/convert')
const WorkQueue = require('../lib/workqueue')
const sha1 = require('sha1')

const workQueue = new WorkQueue()

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

