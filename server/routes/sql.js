var express = require('express');
var router = express.Router();
var knex = require('../database');
var dbgeo = require('dbgeo');

/* GET test page. */
router.get('/', function(req, res, next) {
  var sql = req.query.q;
  console.log(`Executing SQL: ${sql}`);

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

  knex.raw(sql)
    .then((resp) => dbGeoParse(resp['rows']))
    .then((output) => {
      res.send(output)
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;
