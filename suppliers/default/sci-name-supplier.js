module.exports.supply = function(params, apiResults, choices, cb) {
  var rawSciName = apiResults.pages.scientificName
    , rawSciNameTokens = rawSciName.split(' ')
    , sciNameTokens = [rawSciNameTokens[0], rawSciNameTokens[1]]
    , subspeciesCandidate = rawSciNameTokens[2];

  if (subspeciesCandidate && /^[a-z].*/.test(subspeciesCandidate)) {
    sciNameTokens.push(subspeciesCandidate)
  }

  return cb(null, { text: sciNameTokens.join(' ') });
}
