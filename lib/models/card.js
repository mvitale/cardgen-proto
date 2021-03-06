/*
 * Card
 */
var reqlib = require('app-root-path').require;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = reqlib('lib/template-manager');
var speciesDataSupplier = reqlib('lib/suppliers/data/species-data-supplier')
  , speciesImagesSupplier = reqlib('lib/suppliers/choice/species-images-supplier')
  ;
var CardWrapper = reqlib('lib/template-renderer/card-wrapper');

var cardSchema = new Schema({
  templateName: {
    type: String,
    required: true
  },
  templateVersion: {
    type: String,
    required: true
  },
  templateParams: {
    type: Object,
    default: {}
  },
  choices: {
    type: Object,
    default: {}
  },
  choiceTips: {
    type: Object,
    default: {}
  },
  data: {
    type: Object,
    required: true,
    default: {}
  },
  userData: {
    type: Object,
    required: true,
    default: {}
  },
  userId: {
    type: Number,
    required: true
  },
  appId: {
    type: String,
    required: true
  },
  locale: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 0
  },
  _deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck',
    tags: {
      type: [Schema.Types.ObjectId],
      index: true
    }
  }
}, {
  timestamps: true
});

cardSchema.methods.populateDefaultsAndChoices = function(log) {
  if (!this.templateVersion) {
    this.templateVersion = templateManager.maxTemplateVersion(this.templateName, this.appId);
  }

  return templateManager.getDefaultAndChoiceData(
    this.templateName, 
    this.templateVersion, 
    this.locale, 
    this.templateParams, 
    log
  ).then((data) => {
    this.data = data.defaultData;
    this.choices = data.choices;
    this.choiceTips = data.choiceTips;

    return this;
  });
};

cardSchema.methods.needsUpgrade = function() {
  return templateManager.isTemplateVersionObsolete(this.templateVersion, this.templateName, this.appId);
}

cardSchema.methods.template = function() {
  return templateManager.getTemplate(this.templateName, this.templateVersion, this.locale);
}

cardSchema.methods.refreshMainPhotoChoices = function(log) {
  return speciesDataSupplier.supply(this.templateParams, log, this.locale)
  .then((data) => {
    return speciesImagesSupplier.supply({}, data, this.locale)
  })
  .then((result) => {
    this.choices.mainPhoto = result.choices; 
    this.markModified('choices');
    return this;
  });
}

cardSchema.methods.wrapped = function() {
  return CardWrapper.newInstanceWithTemplate(this, templateManager.getTemplate(
    this.templateName,
    this.templateVersion,
    this.locale
  ))
}

cardSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

cardSchema.statics.copy = function(orig, userId, deck, upgrade) {
  var copy = new this();
  copy.templateName = orig.templateName;
  copy.templateVersion = upgrade ? 
    templateManager.maxTemplateVersion(orig.templateName, orig.appId) : 
    orig.templateVersion;
  copy.templateParams = orig.templateParams;
  copy.choices = orig.choices;
  copy.choiceTips = orig.choiceTips;
  copy.data = orig.data;
  copy.userData = orig.userData;
  copy.appId = orig.appId;
  copy.locale = orig.locale;
  copy.userId = userId;
  copy._deck = deck;
  return copy;
}

module.exports = mongoose.model('Card', cardSchema);

