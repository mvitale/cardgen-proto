module.exports.extractClassName = function(apiResults) {
  var ancestors = apiResults.hierarchy_entries.ancestors
    , classLevelResults
    , result = ''
    ;

  if (ancestors) {
    classLevelResults = ancestors.filter((result) => {
      return result.taxonRank === 'class'
    });

    if (classLevelResults.length && classLevelResults[0].scientificName) {
      result = classLevelResults[0].scientificName;
    }
  }

  return result;
}
