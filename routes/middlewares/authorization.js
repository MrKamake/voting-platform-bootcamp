const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(301).redirect('/login');
};

exports.extendSession = (req, res, next) => {
  if (!req.body.remember_me) {
    return next();
  }
  res.cookie('remember_me', _, { path: '/', maxAge: 604800000 });

  return next();
};

exports.verifyUserData = passport => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            done(null, false, { message: 'Incorrect username.' });
          }
          const isValidPassword = await user.validatePassword(password);
          if (!isValidPassword) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        } catch (err) {
          done(err);
        }
        done(null, 123);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
