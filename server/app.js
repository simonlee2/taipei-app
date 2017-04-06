var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var cafes = require('./routes/cafes');

var knex = require('./database');
var bookshelf = require('bookshelf')(knex);
var st = require('knex-postgis')(knex);
var dbgeo = require('dbgeo');

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
app.use('/cafes', cafes);

/*
 * Grab SQL query from URL parameter `q`
 */
app.use('/sql', function(req, res) {
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
