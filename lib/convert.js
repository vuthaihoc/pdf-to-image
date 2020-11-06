const { createCanvas } = require('canvas')
const pdfjs = require('pdfjs-dist')
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry')

const CMAP_URL = "../node_modules/pdfjs-dist/cmaps/";
const CMAP_PACKED = true;

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

module.exports = async ({ mimeType = 'image/jpeg', pageNumber = 1, scale = 1.0, source }) => {
  source.nativeImageDecoderSupport = 'none'
  source.cMapUrl = CMAP_URL
  source.cMapPacked = CMAP_PACKED
  // source.disableFontFace = false
  const doc = await pdfjs.getDocument(source).promise
  const page = await doc.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvasFactory = new CanvasFactory()
  const { canvas, context: canvasContext } = canvasFactory.create(viewport.width, viewport.height)
  await page.render({ canvasContext, viewport, canvasFactory }).promise
  return canvas.toBuffer(mimeType)
}
