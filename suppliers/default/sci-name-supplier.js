module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var rawSciName = apiResults.pages.scientificName;
  console.log(JSON.stringify(apiResults, null, 2));
  console.log(rawSciName);
  var rawSciNameTokens = rawSciName.split(' ')
    , sciNameTokens = [rawSciNameTokens[0], rawSciNameTokens[1]]
    , subspeciesCandidate = rawSciNameTokens[2];

  if (subspeciesCandidate && /^[a-z].*/.test(subspeciesCandidate)) {
    sciNameTokens.push(subspeciesCandidate)
  }

  return cb(null, sciNameTokens.join(' '));
}
