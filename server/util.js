var dbgeo = require('dbgeo');

function pointParamValid(paramString) {
  // paramString = @{lat},{long}
  let regex = /[-\d.]+/gi;
  let matches = paramString.match(regex);
  return matches.length == 2;
};

function pointFromParam(paramString) {
  // paramString = @{lat},{long}
  let regex = /[-\d.]+/gi;
  return paramString.match(regex);
};

function dbGeoParse(data) {
  return new Promise(function (resolve, reject) {
    dbgeo.parse(data, {
      outputFormat: 'geojson',
      geometryColumn: 'point',
      geometryType: 'wkb'
    }, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  pointParamValid,
  pointFromParam,
  dbGeoParse
}
