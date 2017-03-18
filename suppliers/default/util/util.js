module.exports.extractClassName = function(apiResults) {
  var ancestors = apiResults.hierarchy_entries.ancestors
    , classLevelResults = ancestors.filter((result) => {
        return result.taxonRank === 'class'
      })
    , result = classLevelResults.length ?
        classLevelResults[0].scientificName : null;
    ;

  return result;
}
