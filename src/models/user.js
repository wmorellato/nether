/**
 * Model for users. I chose to use JWTs because I am applying
 * what I learned in the Node.js course I took, but in case I
 * find a better solution (or equal) and just want to learn a
 * new way, I will use it.
 *
 * Also, I am using blake2s to hash the passwords.
 */

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const blake = require('blakejs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.createAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString(), admin: user.admin },
      process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.pre('save', function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = blake.blake2sHex(user.password);
  }

  next();
});

userSchema.statics.findByCredentials = async function(email, pass) {
  const user = await User.findOne({ email });
  const password = blake.blake2sHex(pass);

  if (user) {
    if (password !== user.password) {
      throw new Error('unable to login');
    }

    return user;
  }

  throw new Error('unable to login');
};

const User = mongoose.model('User', userSchema);

module.exports = User;
