var express = require('express');
var router = express.Router();
var util = require('../util');
var knex = require('../database');
var st = require('knex-postgis')(knex);

function getAllPoints(tableName) {
  return (req, res, next) => {
    /*
    Form query:

    select name, point, ST_Distance(
      point,
      'SRID=4326;Point(121.5618483 25.0376636)'
    ) as distance
    from cafes;
    */
    knex.select('*')
    .from(tableName)
    .then((data) => util.dbGeoParse(data))
    .then((output) => {
      res.send(output)
    })
    .catch((err) => {
      res.send(err);
    })
  }
}

function getKNearestPoints(tableName) {
  return (req, res, next) => {
    let point = req.params['point'];
    let k = req.params['k'];
    var lat, lng;
    // Check point
    if (util.pointParamValid(point)) {
      [lat, lng] = util.pointFromParam(point);
    } else {
      res.send(`Invalid point parameter ${point}`);
    }

    console.log(`Requesting ${tableName} around (${lat}, ${lng})`);

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
    .from(tableName)
    .orderByRaw(`point <-> 'SRID=4326;${wkt}'`)
    .limit(k)
    .then((data) => util.dbGeoParse(data))
    .then((output) => {
      res.send(output)
    })
    .catch((err) => {
      res.send(err);
    })
  }
}

function withinRadiusPoints(tableName) {
  return (req, res, next) => {
    let point = req.params['point'];
    var radius = req.params['radius'];
    var lat, lng;

    // Check point
    if (util.pointParamValid(point)) {
      [lat, lng] = util.pointFromParam(point);
    } else {
      res.send(`Invalid point parameter ${point}`);
    }

    console.log(`Requesting ${tableName} within ${radius} meters from lat: ${lat}, lng: ${lng})`);

    /*
    Form query:

    select name, point, ST_Distance(
      point,
      'SRID=4326;Point(121.5618483 25.0376636)'
    ) as distance
    from cafes
    where ST_DWithin(
      point::geography,
      'SRID=4326;Point(121.5618483 25.0376636)'::geography,
      600
    );
    */

    let wkt = `Point(${lng} ${lat})`;
    let geogPoint = st.geography('point');
    let geogWkt = st.geography(st.geomFromText(wkt, 4326));
    knex.select('name', 'point', st.distance(geogPoint, geogWkt).as('distance'))
    .from(tableName)
    .where(st.dwithin(geogPoint, geogWkt, radius))
    .then((data) => util.dbGeoParse(data))
    .then((output) => {
      res.send(output)
    })
    .catch((err) => {
      res.send(err);
    })
  }
}

/*
  All locations
*/
router.get('/', getAllPoints('cafes'));

/*
  Within distance
*/
router.get('/:point/within/:radius', withinRadiusPoints('cafes'));

/*
  GET cafes api
  Returns info for the `k` closest cafes from coordinate `point`
*/
router.get('/:point/nearest/:k', getKNearestPoints('cafes'));

module.exports = router;
