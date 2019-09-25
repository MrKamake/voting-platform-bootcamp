const express = require('express');
const router = express.Router();

const passport = require('passport');

const signup = require('./controllers/signup.controller');
const votingController = require('./controllers/voting.controller');
const authorization = require('./middlewares/authorization');

authorization.verifyUserData(passport);

router.get('/', authorization.isAuthenticated, votingController.getAll);

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', signup.createUser);

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
      return next();
    }
    res.cookie('remember_me', _, { path: '/', maxAge: 604800000 });

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

router.get(
  '/votings',
  authorization.isAuthenticated,
  votingController.getMyVote
);

router.get('/votings/new', authorization.isAuthenticated, (req, res, next) => {
  res.render('new');
});

router.post('/votings/new', votingController.createVote);

router.get('/votings/:id', (req, res, next) => {
  res.render('vote');
});

module.exports = router;
