var express = require('express');
var router = express.Router();
var util = require('../util');
var knex = require('../database');
var st = require('knex-postgis')(knex);
const tableName = 'cafes';

function query(tableName, parameters) {
  // Return all cafes if no location to query
  if (!parameters.location) {
    return knex.select('*').from(tableName)
  }

  let location = parameters.location
  let radius = parameters.radius || 1000
  let limit = parameters.limit || 20

  // Convert valid location to latitude and longitude
  var lat, lng;
  if (util.pointParamValid(location)) {
    [lat, lng] = util.pointFromParam(location);
  } else {
    throw `Invalid point parameter ${location}`;
  }

  console.log(`Requesting ${limit} ${tableName} within ${radius} meters from lat: ${lat}, lng: ${lng})`);

  let wkt = `Point(${lng} ${lat})`;
  let geogPoint = st.geography('point');
  let geogWkt = st.geography(st.geomFromText(wkt, 4326));

  return knex.select('*', st.distance(geogPoint, geogWkt).as('distance'))
  .from(tableName)
  .where(st.dwithin(geogPoint, geogWkt, radius))
  .orderByRaw(`point <-> 'SRID=4326;${wkt}'`)
  .limit(limit);
}

function searchWithLocation(tableName) {
  return (req, res, next) => {
    if (req.query.location === undefined) {
      next();
      return
    }

    let parameters = {
      location: req.query.location,
      radius: req.query.radius,
      limit: req.query.limit
    }

    query(tableName, parameters)
      .then((data) => util.dbGeoParse(data))
      .then((output) => {
        res.send(output)
      })
      .catch((err) => {
        res.send(err);
      })
  }
}

function searchWithBounds(tableName) {
  return (req, res, next) => {
    if (req.query.bounds === undefined) {
      next();
      return
    }
  }
}

function all(tableName) {
  return (req, res, next) => {
    console.log('all');
    knex.select('*').from(tableName)
      .then((data) => util.dbGeoParse(data))
      .then((output) => {
        res.send(output);
      })
      .catch((err) => {
        res.send(err);
      })
  }
}

/*
 * if no parameters at all, return everything
 * if location is included, query using geographic coordinate
 * if bounds is included, query using bounding coorindates
 */

/*
  Endpoint
*/
router.get('/',
  searchWithLocation(tableName),
  searchWithBounds(tableName),
  all(tableName)
);

module.exports = router;
