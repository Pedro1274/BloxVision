const bcrypt = require("bcrypt");

exports.hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

exports.comparePasswords = (input, hash) => {
  return bcrypt.compare(input, hash);
};