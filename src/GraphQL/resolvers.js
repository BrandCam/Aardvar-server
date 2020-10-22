const User = require("../models/User");
const Project = require("../models/Projects");
const { userResolver } = require("./resolvers/userResolvers");
const { reportResolver } = require("./resolvers/reportResolvers");
const { projectResolver } = require("./resolvers/projectResolvers");
const { logInResolver } = require("./resolvers/logInResolvers");
const { commentResolver } = require("./resolvers/commentResolvers");
const { chatResolver } = require("./resolvers/chatResolvers");
// Provide resolver functions for your schema fields
const resolvers = {
  Subscription: {
    ...chatResolver.Subscripton,
    ...commentResolver.Subscripton,
  },
  Query: {
    ...userResolver.Query,
    ...projectResolver.Query,
    ...logInResolver.Query,
    ...reportResolver.Query,
    ...chatResolver.Query,
    hello: () => "Hello world!",
  },
  Mutation: {
    ...userResolver.Mutation,
    ...projectResolver.Mutation,
    ...logInResolver.Mutation,
    ...reportResolver.Mutation,
    ...commentResolver.Mutation,
    ...chatResolver.Mutation,
  },

  User: {
    projects(parent) {
      const projects = parent.projects.map(async (id) => {
        let proj = await Project.findById(id).exec();
        return proj;
      });
      return projects;
    },
  },
  Project: {
    admins(parent) {
      const admins = parent.admins.map(async (id) => {
        let admin = await User.findById(id).exec();
        return admin;
      });
      return admins;
    },
    owner(parent) {
      const owner = User.findById(parent.owner).exec();
      return owner;
    },
    reports(parent, args, context) {
      let reports = [...parent.reports];
      let argsKeys = Object.keys(args);
      let { order, limit, page } = args;
      let filteredArgsKeys = argsKeys.filter(
        (arg) =>
          arg !== "order" &&
          arg !== "limit" &&
          arg !== "page" &&
          args[arg] !== null
      );

      if (filteredArgsKeys.length) {
        reports = parent.reports.filter((report) => {
          let isValad = true;
          for (let i = 0; i < filteredArgsKeys.length; i++) {
            if (Array.isArray(args[filteredArgsKeys[i]])) {
              let hasKey = false;
              for (let j = 0; j < args[filteredArgsKeys[i]].length; j++) {
                if (
                  report[filteredArgsKeys[i]] === args[filteredArgsKeys[i]][j]
                ) {
                  hasKey = true;
                }
                if (hasKey) break;
                if (!hasKey && j === args[filteredArgsKeys[i]].length - 1) {
                  isValad = false;
                }
              }
            } else {
              isValad =
                report[filteredArgsKeys[i]] === args[filteredArgsKeys[i]];
            }
            if (!isValad) break;
          }
          return isValad;
        });
      }
      if (order && order < 0) {
        reports = reports.reverse();
      }
      if (limit && page) {
        let start = page - 1;
        let end = limit;
        if (page > 1) {
          start = start * limit;
          end = start + limit;
        }
        let paginated = reports.slice(start, end);
        return { reports: paginated, length: reports.length };
      }
      return { reports, length: reports.length };
    },
  },
  Report: {
    created_by(parent) {
      const creator = User.findById(parent.created_by).exec();
      return creator;
    },
    worked_by(parent) {
      const users = parent.worked_by.map(async (id) => {
        let user = await User.findById(id).exec();
        return user;
      });
      return users;
    },
  },
  Comment: {
    author(parent) {
      const creator = User.findById(parent.author).exec();
      return creator;
    },
  },
};

module.exports = resolvers;
