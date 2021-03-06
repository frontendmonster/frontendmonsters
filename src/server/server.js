const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./configs/config');

// Init
const app = express();
const isDevMode = config.server.env === 'dev';
const connectionString = isDevMode ? config.db.debugConnectionString : config.db.connectionString;

app.disable('x-powered-by');
if (isDevMode) {
  console.warn('Dev Mode');
}

function onConnectedToDb(error) {
  if (error) {
    console.error(error);
    return;
  }

  // if (isDevMode) {
    config.initMockDatabase();
  // }
  console.log('[mongoose]: Connected to database');
}

// DB
mongoose.connect(connectionString, onConnectedToDb);

// Middlewares
app.use(favicon(config.pathes.favIconPath));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());
config.initJWTPassport(passport);

// Statics
app.use(express.static(config.pathes.distPath));
app.use(express.static(config.pathes.publicPath));

// Routes
const apiRouter = require('./routes/api.routes')(passport);

app.use('/api', apiRouter);

// Requests
app.get('/*', function(req, res) {
  res.sendFile(config.pathes.index);
});

// 404 Not Found
app.use(function(req, res, next) {
  const err = new Error('Not Found');

  next(err);
});

// Error!
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.json({
    error: {},
    message: err.message
  });
});

// Exports
module.exports = app;
