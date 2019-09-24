const express = require('express');
const router = express.Router();

const passport = require('passport');
const session = require('express-session');

const signup = require('./controllers/signup.controller');
const { isAuthenticated, verifyUserData } = require('./middlewares/passport');

verifyUserData(passport);

router.get('/', isAuthenticated, (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup/create', signup.createUser);

router.get('/login', (req, res, next) => {
  res.render('login', { message: req.flash('error') });
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res, next) => {
    if (!req.body.remember_me) {
      return next(err);
    }
    res.cookie('remember_me', _, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return next();
  },
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.logout();
    req.session.destroy(err => {
      if (err) {
        next(err);
      } else {
        res.redirect('/login');
      }
    });
  }
});

module.exports = router;
