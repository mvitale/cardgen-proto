module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var data = [
    {
      'trait': {
        'key': 'Trait 1 key',
        'val': 'Trait 1 val'
      }
    },
    {
      'trait': {
        'key': 'Trait 2 key',
        'val': 'Trait 2 val'
      }
    }
  ];


  cb(null, data);
}
