const bcrypt = require("bcryptjs");

const genHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  hashedPass = await bcrypt.hash(password, salt);

  return hashedPass;
};

const compare = async (plaintext, hashed) => {
  const isMatch = await bcrypt.compare(plaintext, hashed);

  return isMatch;
};

module.exports = {
  genHash,
  compare,
};
