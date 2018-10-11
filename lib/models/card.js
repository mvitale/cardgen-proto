/*
 * Card
 */
var reqlib = require('app-root-path').require;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = reqlib('lib/template-manager');

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
  // TODO: promises all the way down
  return new Promise((resolve, reject) => {
    if (!this.templateVersion) {
      this.templateVersion = templateManager.maxTemplateVersion(this.templateName, this.appId);
    }

    templateManager.getDefaultAndChoiceData(this.templateName,
      this.templateVersion, this.locale, this.templateParams, log, (err, data) => {
        if (err) return reject(err);

        this.data = data.defaultData;
        this.choices = data.choices;
        this.choiceTips = data.choiceTips;

        resolve(this);
      }
    );
  });
};

cardSchema.methods.needsUpgrade = function() {
  return templateManager.isTemplateVersionObsolete(this.templateVersion, this.templateName, this.appId);
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
