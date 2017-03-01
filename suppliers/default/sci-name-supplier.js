module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var result = apiResults['pages']
    , taxonConcept = result['response']['taxonConcept'][0]
    , rawSciName = taxonConcept['dwc:scientificName'][0]
    , rawSciNameTokens = rawSciName.split(' ')
    , sciNameTokens = [rawSciNameTokens[0], rawSciNameTokens[1]]
    , subspeciesCandidate = rawSciNameTokens[2];

  if (subspeciesCandidate && /^[a-z].*/.test(subspeciesCandidate)) {
    sciNameTokens.push(subspeciesCandidate)
  }

  return cb(null, sciNameTokens.join(' '));
}
