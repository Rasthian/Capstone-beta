const bcrypt = require('bcrypt');

const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

module.exports = verifyPassword;
