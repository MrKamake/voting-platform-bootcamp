const express = require('express');
const router = express.Router();

const passport = require('passport');

const authorization = require('./middlewares/authorization');
const userController = require('./controllers/user.controller');
const votingController = require('./controllers/voting.controller');

authorization.verifyUserData(passport);

router.get('/', authorization.isAuthenticated, votingController.getAll);

router.get('/signup', userController.signup);
router.post('/signup', userController.createUser);

router.get('/login', userController.getLoginPage);
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  authorization.extendSession,
  userController.login
);
router.get('/logout', userController.logout);

router.get(
  '/votings',
  authorization.isAuthenticated,
  votingController.getMyVotes
);
router.get('/votings/new', authorization.isAuthenticated, votingController.getNewPage);
router.post(
  '/votings/new',
  authorization.isAuthenticated,
  votingController.createVote
);

router.get('/votings/success', (req, res, next) => {
  res.render('success');
});
router.get('/votings/error', (req, res, next) => {
  next(err);
});

router.get(
  '/votings/:id',
  authorization.isAuthenticated,
  votingController.getOneVote
);
router.post(
  '/votings/:id',
  authorization.isAuthenticated,
  votingController.update
);
router.delete(
  '/votings/:id',
  authorization.isAuthenticated,
  votingController.delete
);

module.exports = router;
