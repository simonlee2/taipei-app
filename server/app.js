var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');

var knex = require('./database');
var bookshelf = require('bookshelf')(knex);
var st = require('knex-postgis')(knex);
var util = require('./util');

var NYC_Stations = bookshelf.Model.extend({
  tableName: 'nyc_subway_stations'
});

var Cafes = bookshelf.Model.extend({
  tableName: 'cafes'
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/test', test);

/*
 * :point should be in form of @{lat},{long}
 */
app.use('/cafes/:point/:k', function(req, res) {
  let point = req.params['point'];
  let k = req.params['k'];
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

app.use('/stations', function(req, res) {
  NYC_Stations.collection().query((qb) => {
    qb.select('name', st.x(st.transform('geom', 4326)).as('lat'), st.y(st.transform('geom', 4326)).as('long'));
  })
  .fetch()
  .then((model) => {
    res.send(model.toJSON());
  })
  .catch((error) => {
    console.log(error);
    res.send(error);
  })


  // new NYC_Neighborhoods().fetchAll({
  //     columns: ['boroname', 'name', 'geom']
  //   })
  //   .then(function(neighborhoods) {
  //     res.send(neighborhoods.toJSON())
  //   }).catch(function(error) {
  //     console.log(error);
  //     res.send('An error occurred.');
  //   });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
