const User = require('../../models/User');

exports.getLoginPage = (req, res) => {
  res.render('login', { message: req.flash('error') });
};

exports.login = (req, res) => {
  res.redirect('/');
};

exports.logout = (req, res, next) => {
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
};

exports.signup = (req, res) => {
  res.render('signup');
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      next(err);
    }
    
    const newUserData = {
      email,
      name: name,
      password
    };
    await new User(newUserData).save();

    res.redirect('/login');
  } catch (err) {
    next(err);
  }
};
