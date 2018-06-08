var reqlib = require('app-root-path').require;
var util = reqlib('lib/suppliers/shared/util');

var taxonGroupTraits = {
      "annelids": [
        "bodyLength",
        "development",
        "lifespan",
        "numberofEggs",
        "activity"
      ],
      "bacteria": [
        "length",
        "shape",
        "locomotion",
        "metabolism",
        "reproduction"
      ],
      "echinoderms": [
        "size",
        "motility",
        "lifespan",
        "reproduction",
        "zonation"
      ],
      "fishes": [
        "bodyLength",
        "adultWeight",
        "lifespan",
        "numberofEggs",
        "nestType"
      ],
      "archaea": [
        "diameter",
        "cellShape",
        "habitat",
        "metabolism",
        "symbioticStatus"
      ],
      "platyhelminthes": [
        "totalLength",
        "numberofEggs",
        "lifespan",
        "habitat",
        "symbioticStatus"
      ],
      "mollusks": [
        "bodyLength",
        "shellmantle",
        "lifespan",
        "numberofEggs",
        "activity"
      ],
      "plants": [
        "height",
        "growthForm",
        "lifeCycle",
        "flowerColor",
        "sunlightsoil"
      ],
      "fungi": [
        "capSize",
        "growthHabit",
        "sporeSurface",
        "capColor",
        "sporePrint"
      ],
      "nematodes": [
        "totalLength",
        "reproduction",
        "numberofEggs",
        "habitat",
        "symbioticStatus"
      ],
      "reptiles": [
        "totalLength",
        "adultWeight",
        "adultHabitat",
        "clutchbroods",
        "activity"
      ],
      "arthropods": [
        "adultBodyLength",
        "development",
        "adultLifespan",
        "numberofEggs",
        "wings"
      ],
      "birds": [
        "wingspan",
        "adultWeight",
        "lifespan",
        "clutchbroods",
        "nestType"
      ],
      "cnidarians": [
        "bodyLength",
        "form",
        "lifespan",
        "reproduction",
        "depthZone"
      ],
      "amphibians": [
        "snoutventLength",
        "adultHabitat",
        "development",
        "clutchbroods",
        "activity"
      ],
      "protists": [
        "organismCells",
        "cellShape",
        "lifeCycle",
        "motility",
        "reproduction"
      ],
      "sponges": [
        "height",
        "energySource",
        "host",
        "reproduction",
        "habitat"
      ],
      "mammals": [
        "adultBodyLength",
        "adultWeight",
        "lifespan",
        "offspringlitters",
        "ageofFemaleMaturity"
      ],
      "animals": [
        "bodyLength",
        "adultWeight",
        "lifespan",
        "offspring",
        "habitat"
      ]
    }
  , allTraits = util.uniqueValues(taxonGroupTraits)
  , allTraitsByLocale = {}
  ;

module.exports.allTraits = function(locale) {
  return allTraits;
}

module.exports.traitKeysForTaxonGroup = function(taxonGroup) {
  return taxonGroupTraits[taxonGroup].slice(0);
}
