var appRootPath = require('app-root-path')
  , reqlib = appRootPath.require
  , parseCssFont = require('parse-css-font')
  , opentype = require('opentype.js')
  , config = reqlib('lib/config/config')
  ;

var fonts = {};

function loadFonts() {
  fonts['Open Sans'] = opentype.loadSync(appRootPath.resolve('/lib/fonts/opensans/OpenSans-Regular.ttf'));
}
module.exports.loadFonts = loadFonts;

function fontFromCtx(ctx) {
  var fontParts = parseCssFont(ctx.font)
    , font = fonts['Open Sans']
    , size = parseFloat(font.size.replace('px', ''))
    ;

  console.log(fontParts);

  return {
    font: font,
    size: size
  }
}

function fillText(ctx, text, x, y) {
  var fontInfo = fontFromCtx(ctx);
  fontInfo.font.draw(ctx, text, x, y, fontInfo.size);   
}
module.exports.fillText = fillText;

function textWidth(ctx, text) {
  var fontInfo = fontFromCtx(ctx);
  return fontInfo.font.getAdvancedWidth(text, fontInfo.size);
}
module.exports.textWidth = textWidth;
