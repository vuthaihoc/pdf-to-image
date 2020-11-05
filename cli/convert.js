const fs = require('fs')
const convert = require('../lib/convert')
const http = require('http');
const request = require('request');



// source as a file URL, output as PNG

const url = `file://${__dirname}/data/test.pdf`

convert({
  mimeType: 'image/png',
  pageNumber: 1,
  scale: 2.0,
  source: { url },
}).then(buffer => fs.promises.writeFile(__dirname + '/data/test.png', buffer)).catch(error => {
  console.error(error)
})

// source as a buffer, output as JPEG

fs.promises.readFile(__dirname + '/data/test.pdf').then(data => convert({
  mimeType: 'image/jpeg',
  pageNumber: 1,
  scale: 2.0,
  source: { data },
})).then(buffer => fs.promises.writeFile(__dirname + '/data/test.jpg', buffer)).catch(error => {
  console.error(error)
})


// test pdf to base64 image
let pdf_url = 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
var escaped_url = require('querystring').escape(pdf_url)
let port = 8000

position_list = [
  {pageNumber: 1, x_top: 1, y_top: 1, x_bottom: 800, y_bottom: 800, scale: 2},
  {pageNumber: 4, x_top: 1, y_top: 1, x_bottom: 800, y_bottom: 800, scale: 2},
  {pageNumber: 3, x_top: 1, y_top: 1, x_bottom: 800, y_bottom: 800, scale: 2}
]
  coordinate = encodeURIComponent(JSON.stringify(position_list)) 

request(`http://localhost:${port}/convert?url=${escaped_url}&scale=1&position_list=${coordinate}`, { json: true }, (err, res, images) => {
  if (err) { return console.log(err); }
  let html = '<br>';
  images.forEach(element => {
    html += '<div style="text-align: center" ><img style=\"border: solid #ccc 1px; margin: 10px 0; \" src=\'' + element+ '\'> </div><br>';
  });

  filename = __dirname + '/data/test.html'
  fs.writeFile(filename, html, function(err){});
  console.log(filename);

});
