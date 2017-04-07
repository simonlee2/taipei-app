var express = require('express');
var router = express.Router();
var util = require('../util');
var knex = require('../database');
var bookshelf = require('bookshelf')(knex);
var st = require('knex-postgis')(knex);

var Cafes = bookshelf.Model.extend({
  tableName: 'cafes'
});

/* GET cafes api */
router.get('/:point/:k', function(req, res, next) {
  let point = req.params['point'];
  let k = req.params['k'];

  if (util.pointParamValid(point)) {
    var [lat, lng] = util.pointFromParam(point);
    console.log(`Requesting cafes around (${lat}, ${lng})`);

    /*
    Form query:

    select name, point, ST_Distance(
      point,
      'SRID=4326;Point(121.5618483 25.0376636)'
    ) as distance
    from cafes
    order by
      point <->
      'SRID=4326;Point(121.5618483 25.0376636)'
    limit 10;
    */
    let wkt = `Point(${lng} ${lat})`;
    knex.select('name', 'point', st.distance(st.geography('point'), st.geography(st.geomFromText(wkt, 4326))).as('distance'))
    .from('cafes')
    .orderByRaw(`point <-> 'SRID=4326;${wkt}'`)
    .limit(k)
    .then((data) => util.dbGeoParse(data))
    .then((output) => {
      console.log(output)
      res.send(output)
    })
    .catch((err) => {
      res.send(err);
    })
  } else {
    res.send(`Invalid point parameter ${point}`);
  }
});

module.exports = router;
