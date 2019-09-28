const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

userSchema.methods.validatePassword = async function(password) {
  try {
    const user = this;
    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword;
  } catch (error) {
    next(error);
  }
};

userSchema.pre('save', async function(next) {
  try {
    const user = this;
    const SALT_ROUNDS = 10;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
