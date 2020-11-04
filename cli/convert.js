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



// http.get('http://localhost:8001/convert?url=https%3A%2F%2Fai2-website.s3.amazonaws.com%2Fpublications%2Fclark_divvala.pdf&scale=1&coordinate_list=[{pageNumber:%20%271%27,%20%27x_top%27:%20%2712%27,%27y_top%27:%20%2712%27,%27x_bottom%27:%20%27300%27,%27y_bottom%27:%20%27300%27},%20{%27pageNumber%27:%20%272%27,%27x_top%27:%20%2712%27,%27y_top%27:%20%2712%27,%27x_bottom%27:%20%27300%27,%27y_bottom%27:%20%27300%27}]', (resp) => {
//   console.log(resp);

// }).on("error", (err) => {
//   console.log("Error: " + err.message);
// });


// test pdf to base64 image
let pdf_url = 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
var escaped_url = require('querystring').escape(pdf_url)
let port = 8000


coordinate_list = [
  {pageNumber: 1, x_top: 1, y_top: 1, x_bottom: 300, y_bottom: 300, scale: 2},
  {pageNumber: 2, x_top: 1, y_top: 1, x_bottom: 300, y_bottom: 300, scale: 2},
  {pageNumber: 3, x_top: 100, y_top: 100, x_bottom: 200, y_bottom: 300, scale: 2}
]
  coordinate = encodeURIComponent(JSON.stringify(coordinate_list)) 

request(`http://localhost:${port}/convert?url=${escaped_url}&scale=1&coordinate_list=${coordinate}`, { json: true }, (err, res, images) => {
  if (err) { return console.log(err); }
  let html = '<br>';
  images.forEach(element => {
    html += '<div><img src=\'' + element+ '\'> </div><br>';
  });

  filename = __dirname + '/data/test.html'
  fs.writeFile(filename, html, function(err){});
  console.log(filename);

});