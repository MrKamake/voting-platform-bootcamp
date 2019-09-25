const express = require('express');
const router = express.Router();

const passport = require('passport');

const signup = require('./controllers/signup.controller');
const { createVote } = require('./controllers/new.controller');
const authorization = require('./middlewares/authorization');
const User = require('../models/User');
const Vote = require('../models/VotingElement');

authorization.verifyUserData(passport);

router.get('/', authorization.isAuthenticated, async (req, res, next) => {
  const voteList = await Vote.find();
  const voteInformation = await Promise.all(
    voteList.map(async vote => {
      const createUser = await User.findOne({ _id: vote.host });
      const voteDoc = JSON.parse(JSON.stringify(vote._doc));
      const expiration = new Date(vote.expiration);
      const now = new Date();
      const inProgress = Boolean(expiration - now > 0);

      voteDoc.host = createUser.name;
      voteDoc.inProgress = inProgress;

      return voteDoc;
    })
  );

  res.render('main', { voteInformation, title: 'Voting Platform main page' });
});

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
  async (req, res, next) => {
    const voteList = await Vote.find();
    res.render('myPage', { voteList });
  }
);

router.get('/votings/new', authorization.isAuthenticated, (req, res, next) => {
  res.render('new');
});

router.post('/votings/new', createVote, (req, res, next) => {
  res.render('success');
});

router.get('/votings/:id', (req, res, next) => {
  res.render('vote');
});

module.exports = router;
