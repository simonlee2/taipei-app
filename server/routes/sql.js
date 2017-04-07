var express = require('express');
var router = express.Router();
var knex = require('../database');
var util = require('../util');

/* GET test page. */
router.get('/', function(req, res, next) {
  console.log(req.query);
  var sql = req.query.q;
  console.log(`Executing SQL: ${sql}`);

  knex.raw(sql)
    .then((resp) => util.dbGeoParse(resp['rows']))
    .then((output) => {
      res.send(output)
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;
