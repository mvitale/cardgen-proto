var appRootPath = require('app-root-path')
  , reqlib = appRootPath.require
  , parseCssFont = require('parse-css-font')
  , opentype = require('opentype.js')
  , fs = require('fs')
  , config = reqlib('lib/config/config')
  ;

var fonts = {};

// TODO: verify
var weightNames = {
  light: '300',
  normal: '400',
  semibold: '600',
  bold: '700',
  extrabold: '800'
}

function loadFonts() {
  var fontFamilies = config.get('fontFamilies');

  fontFamilies.forEach((family) => {
    var dirname = family.dirname
      , weightDirs = fs.readdirSync(appRootPath.resolve('/lib/fonts/' + dirname))
      ;

    fonts[family.name] = {};

    weightDirs.forEach((weight) => {
      fonts[family.name][weight] = {};
      fonts[family.name][weight].normal = opentype.loadSync(appRootPath.resolve('/lib/fonts/' + dirname + '/' + weight + '/' + 'normal.ttf'));
      fonts[family.name][weight].italic = opentype.loadSync(appRootPath.resolve('/lib/fonts/' + dirname + '/' + weight + '/' + 'italic.ttf'));
    });
  })
}
module.exports.loadFonts = loadFonts;

function resolveWeight(weight) {
  var result;

  if (parseInt(weight).toString() === weight) {
    result = weight;
  } else {
    result = weightNames[weight];

    if (!result) {
      throw new TypeError('unrecognized font weight ' + weight);
    }
  }

  return result;
}

function fontFromCtx(ctx) {
  var fontParts = parseCssFont(ctx.font)
    , size = parseFloat(fontParts.size.replace('px', ''))
    , font
    ;

  font = fonts[fontParts.family[0]][resolveWeight(fontParts.weight)][fontParts.style];

  if (!font) {
    throw new TypeError("can't find font for: " + ctx.font);
  }

  return {
    font: font,
    size: size
  }
}

function fillText(ctx, text, x, y) {
  console.log(text, ctx.font);
  var fontInfo = fontFromCtx(ctx)
    , path = fontInfo.font.getPath(text, x, y, fontInfo.size)
    ; 
  
  path.fill = ctx.fillStyle;
  path.draw(ctx);
}
module.exports.fillText = fillText;

function textWidth(ctx, text) {
  console.log(text, ctx.font);
  var fontInfo = fontFromCtx(ctx);
  return fontInfo.font.getAdvanceWidth(text, fontInfo.size);
}
module.exports.textWidth = textWidth;
