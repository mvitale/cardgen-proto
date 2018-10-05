module.exports.supply = function(params, data, locale) {
  return new Promise((resolve, reject) => {
    var sciName
      , rawSciName
      , rawSciNameTokens
      , sciNameTokens = []
      , subspeciesCandidate
      , results = []
      ;

    if ('scientificName' in data.taxon) {
      rawSciName = data.taxon.scientificName;
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

    if (sciNameTokens.length) {
      sciName = sciNameTokens.join(' ');
      results.push({ text: sciName , choiceKey: sciName});
    }

    resolve({
      choices: results
    });
  });
};

