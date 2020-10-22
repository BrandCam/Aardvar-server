const Project = require("../../models/Projects");
const User = require("../../models/User");
const { getTokenFromContext, checkToken } = require("../../util/jwt");
const { getProjectAuthStatus, validateLogIn } = require("../../util/validate");
const { pubsub } = require("../pubsub");
const { withFilter } = require("graphql-subscriptions");

const COMMENT_ADDED = "COMMENT_ADDED";

module.exports.commentResolver = {
  Query: {},
  Mutation: {
    createComment: async (_, { project_id, report_id, content }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);
      if ((valid && role === "Owner") || role === "Admin") {
        report = project.reports.find((e) => e._id.toHexString() === report_id);

        report.comments.push({
          author: token.id,
          content: content,
        });
        // project.reports.forEach((e) => {
        //   if (e._id.toHexString() === report_id) {
        //     e.comments.push({
        //       author: token.id,
        //       content: content,
        //     });
        //   }
        // });
        let updatedProj = await project.save();
        let newComment = [...report.comments].pop();
        newComment.project_id = project_id;
        newComment.report_id = report_id;

        pubsub.publish(COMMENT_ADDED, { commentAdded: newComment });

        return report;
      } else {
        throw new Error("Only project Members can create comments");
      }
    },
    updateComment: async (
      _,
      { id, project_id, report_id, content },
      context
    ) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const report = project.reports.find(
        (e) => e._id.toHexString() === report_id
      );
      const comment = report.comments.find((e) => e._id.toHexString() === id);
      if (token.id === comment.author.toHexString()) {
        if (content) {
          comment.content = content;
        }
        project.save();
        return comment;
      } else {
        throw new Error("you can only eddit your own comments.");
      }
    },
  },
  Subscripton: {
    commentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([COMMENT_ADDED]),
        (payload, variables) => {
          return (
            payload.commentAdded.project_id === variables.project_id &&
            payload.commentAdded.report_id === variables.report_id
          );
        }
      ),
    },
  },
};
