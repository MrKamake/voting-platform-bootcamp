if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const createError = require('http-errors');
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const logger = require('morgan');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');

const indexRouter = require('./routes/index');

const mongoose = require('mongoose');
const db = mongoose.connection;

mongoose.connect(`${process.env.DATABASE_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MongoDB connecting');
});

const app = express();

// app.use(methodOverride('X-HTTP-Method-Override'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(
  session({
    secret: process.env.SECRET_SESSION,
    cookie: { maxAge: 604800000 },
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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
