const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { genHash, compare } = require("../../util/passHash");
const { validateNewUser, validateLogIn } = require("../../util/validate");
const { getToken, checkToken, getTokenFromContext } = require("../../util/jwt");

module.exports.logInResolver = {
  Query: {
    logInUser: async (_, { email, password }) => {
      const { errors, valid } = validateLogIn({ email, password });
      if (!valid) {
        throw errors;
      }
      let user = await User.findOne({ email });
      if (!user) {
        throw new Error("Wrong cerdentials");
      }
      const match = await compare(password, user.password);
      if (!match) {
        throw new Error("Wrong cerdentials");
      }
      let token = getToken({
        id: user._id,
        email: user.email,
        display_name: user.display_name,
      });
      return { token };
    },
  },
  Mutation: {
    createUser: async (_, { email, password, display_name }) => {
      const { errors, valid } = validateNewUser({
        email,
        password,
        display_name,
      });
      if (!valid) {
        throw errors;
      }
      let check = await User.find({ email });
      if (!check[0]) {
        const encrypted = await genHash(password);
        const user = new User({
          email,
          password: encrypted,
          display_name,
          last_login: Date.now(),
        });
        await user.save();
        const token = await getToken({
          id: user._id,
          email,
          display_name,
        });
        return { token };
      }
      if (check[0]) {
        const err = new Error(
          "A user with that email already exists, please log in"
        );
        throw err;
      }
    },
  },
  Subscripton: {},
};
