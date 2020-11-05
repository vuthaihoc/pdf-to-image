## Example usage

1. `docker build . -t pdf-to-image`
2. `docker run --rm --publish 8000:8000 --name pdf-to-image pdf-to-image`
3. Open http://localhost:8000 and enter a PDF URL to convert



## API support for GET | POST method
 1. Endpoint: /convert
 2. Params:
   - url: URL of document
   - mimeType: [image/png | image/jpeg]
   - position_list: list of position json object, require:
        + pageNumber
        + x_top
        + y_top
        + x_bottom
        + y_bottom
        + scale


Example of position_list, view detail in cli/convert.js : 

```
[
        {pageNumber: 1, x_top: 1, y_top: 1, x_bottom: 300, y_bottom: 300, scale: 2},
        {pageNumber: 2, x_top: 1, y_top: 1, x_bottom: 300, y_bottom: 300, scale: 2},
        {pageNumber: 3, x_top: 100, y_top: 100, x_bottom: 200, y_bottom: 300, scale: 2}
]
```

 Return type is array of base64 image


## Testing

``` 
node cli/convert.js
```
