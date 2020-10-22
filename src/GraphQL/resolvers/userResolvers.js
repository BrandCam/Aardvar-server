const User = require("../../models/User");
const Project = require("../../models/Projects");
const { getTokenFromContext, checkToken, getToken } = require("../../util/jwt");
const { getProjectAuthStatus, validateLogIn } = require("../../util/validate");

module.exports.userResolver = {
  Query: {
    getUser: async (_, { email }) => {
      let user = await User.find({ email });
      return user[0];
    },
  },
  Mutation: {
    updateUser: async (_, values, context) => {
      const { email, display_name } = values;
      const token = checkToken(getTokenFromContext(context));
      const user = await User.findById(token.id).exec();
      if (user) {
        if (email) {
          user.email = email;
        }
        if (display_name) {
          user.display_name = display_name;
        }
        await user.save();
        const token = await getToken({
          id: user._id,
          email: user.email,
          display_name: user.display_name,
        });
        return { token };
      } else {
        throw new Error("Please make an account");
      }
    },
  },
  Subscripton: {},
};
