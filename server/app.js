var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var knex = require('knex')({
  client:'pg',
  connection: {
    host: '127.0.0.1',
    user: 'simon',
    password: 'Wayla87091',
    database: 'nyc',
    charset: 'UTF-8'
  }
});

var bookshelf = require('bookshelf')(knex);
var st = require('knex-postgis')(knex);

var NYC_Stations = bookshelf.Model.extend({
  tableName: 'nyc_subway_stations'
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
