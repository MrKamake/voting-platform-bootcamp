if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const mongoose = require('mongoose');
const db = mongoose.connection;

mongoose.connect(`${process.env.DATABASE_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MongoDB connecting');
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
