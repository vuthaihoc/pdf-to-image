const { createCanvas, Image } = require('canvas')
const pdfjs = require("../build/minified-legacy/build/pdf.js");

class CanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height)
    const context = canvas.getContext('2d')

    return { canvas, context }
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width
    canvasAndContext.canvas.height = height
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
    canvasAndContext.canvas = null
    canvasAndContext.context = null
  }
}


const CMAP_URL = "build/minified-legacy/web/cmaps/";
const CMAP_PACKED = true;

const STANDARD_FONT_DATA_URL = "build/minified-legacy/web/standard_fonts/";

module.exports = async ({ mimeType = 'image/png', pageNumber = 1, scale = 2.0, source, position_list = []}) => {
  source.cMapUrl = CMAP_URL;
  source.cMapPacked = CMAP_PACKED;
  source.standardFontDataUrl = STANDARD_FONT_DATA_URL;
  // source.disableFontFace = false;
  // source.useSystemFonts = true;
  let doc = await pdfjs.getDocument(source).promise
  let error_characters = 0;
  doc.loadingTask.onUnsupportedFeature = function(error){
    if('errorFontGetPath' == error){
      error_characters++;
    }
    if(error_characters >= 10){
      doc.destroy();
    }
  };
  try{
    const page = await doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const canvasFactory = new CanvasFactory()
    const { canvas, context: canvasContext } = canvasFactory.create(viewport.width, viewport.height)
    await page.render({ canvasContext, viewport, canvasFactory }).promise
    return canvas.toBuffer(mimeType)
  }catch(e){
    console.log("Render error", e.message);
    source.disableFontFace = false;
    // source.useSystemFonts = true;
    doc = await pdfjs.getDocument(source).promise
    const page = await doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const canvasFactory = new CanvasFactory()
    const { canvas, context: canvasContext } = canvasFactory.create(viewport.width, viewport.height)
    await page.render({ canvasContext, viewport, canvasFactory }).promise
    return canvas.toBuffer(mimeType)
  }
}
