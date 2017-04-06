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
  console.log(req.params);
  if (util.pointParamValid(point)) {
    var [lat, long] = util.pointFromParam(point);
    // res.send(`Requesting cafes around (${lat}, ${long})`);

    /*
    Form query:

    select name, ST_Distance(
      point,
      'SRID=4326;Point(25.0376636 121.5618483)'
    ) as distance
    from cafes
    order by
      point <->
      'SRID=4326;Point(25.0376636 121.5618483)'
    limit 10;
    */
    Cafes.collection().query((qb) => {
      let wkt = `Point(${lat} ${long})`;
      qb.select('name', st.distance('point', st.geomFromText(wkt, 4326)).as('distance')).from('cafes').orderByRaw(`point <-> 'SRID=4326;Point(${lat} ${long})'`).limit(k)
    })
    .fetch()
    .then((model) => {
      res.send(model.toJSON());
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
  } else {
    res.send(`Invalid point parameter ${point}`);
  }
});

module.exports = router;
