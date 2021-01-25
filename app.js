// Imports
var createError = require('http-errors');
var mongoose = require('mongoose')
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/userRouter')
var leaderRouter = require('./routes/leaderRouter');
var promotionRouter = require('./routes/promotionRouter');
var dishRouter = require('./routes/dishrouter');
var Dishes = require('./models/dishes');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');
var uploadRouter = require('./routes/uploadRouter');
var favoriteDish = require('./models/favorites')
var favoritesRouter = require('./routes/favoritesRouter')





////////////////////////////
////    App Logic      ////
//////////////////////////

// Initilaize Express
var app = express();

app.use(passport.initialize());
// connect to Mongo Database
const url = config.mongoUrl;
const connect = mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true});

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




////////////////////////////////////
////    Application Router     ////
//////////////////////////////////



// Unauthenticated routes
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/upload', uploadRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promotionRouter);
app.use('/favorites',favoritesRouter);




///////////////////////////////
////    Error Handling    ////
/////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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






// Export App Module for use in HTTP Server(./bin/www)
// This Seperates the Business logic From the server logic
module.exports = app;