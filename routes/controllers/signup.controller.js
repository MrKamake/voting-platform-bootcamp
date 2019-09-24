const User = require('../../models/User');

exports.createUser = async (req, res, next) => {
  if (req.body.email && req.body.username && req.body.password) {
    try {
      const newUserData = {
        email: req.body.email,
        name: req.body.username,
        password: req.body.password
      };
      await new User(newUserData).save();

      res.redirect('/login');
    } catch (err) {
      next(err);
    }
  }
};
