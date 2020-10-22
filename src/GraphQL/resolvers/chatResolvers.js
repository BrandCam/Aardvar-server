const Project = require("../../models/Projects");
const User = require("../../models/User");
const { getTokenFromContext, checkToken } = require("../../util/jwt");
const { getProjectAuthStatus, validateLogIn } = require("../../util/validate");
const { withFilter } = require("graphql-subscriptions");
const { pubsub } = require("../pubsub");

const CHAT_COMMENT_ADDED = "CHAT_COMMENT_ADDED";

module.exports.chatResolver = {
  Query: {
    getChat: async (_, { project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);

      if (valid) {
        return project.chat;
      } else {
        throw new Error("unauthorized");
      }
    },
  },
  Mutation: {
    createChatComment: async (_, { project_id, content }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);

      if (valid) {
        if (role === "Owner" || role === "Admin") {
          project.chat.push({
            author: token.id,
            content: content,
          });
          updatedProj = await project.save();
          let newComment = [...updatedProj.chat].pop();
          newComment.project_id = project_id;
          pubsub.publish(CHAT_COMMENT_ADDED, {
            chatCommentAdded: newComment,
          });
          return updatedProj.chat;
        }
      } else {
        throw new Error("unauthorized");
      }
    },
  },
  Subscripton: {
    chatCommentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([CHAT_COMMENT_ADDED]),
        (payload, variables) => {
          return payload.chatCommentAdded.project_id === variables.project_id;
        }
      ),
    },
  },
};
