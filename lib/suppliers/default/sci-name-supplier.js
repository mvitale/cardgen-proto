module.exports.supply = function(params, apiResults, choices, cb) {
  var sciName
    , rawSciName
    , rawSciNameTokens
    , sciNameTokens = []
    , subspeciesCandidate
    ;

  if ('scientificName' in apiResults.pages) {
    rawSciName = apiResults.pages.scientificName;
    rawSciNameTokens = rawSciName.split(' ');

    if (rawSciNameTokens[0]) {
      sciNameTokens.push(rawSciNameTokens[0]);

      if (rawSciNameTokens[1]) {
        sciNameTokens.push(rawSciNameTokens[1])
      }

      subspeciesCandidate = rawSciNameTokens[2];

      if (subspeciesCandidate && /^[a-z].*/.test(subspeciesCandidate)) {
        sciNameTokens.push(subspeciesCandidate)
      }
    }
  }

  sciName = sciNameTokens.join(' ');
  return cb(null, { text:  sciName });
}
