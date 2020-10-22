const Project = require("../../models/Projects");
const User = require("../../models/User");
const { getTokenFromContext, checkToken, getToken } = require("../../util/jwt");
const { getProjectAuthStatus, validateLogIn } = require("../../util/validate");
const sendMail = require("../../util/email");

module.exports.projectResolver = {
  Query: {
    getProject: async (_, { id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(id).exec();
      // console.log(project);
      // console.log(token);
      let { valid, role } = getProjectAuthStatus(token, project);
      if (valid) {
        return project;
      } else {
        throw new Error("unauthorized");
      }
    },
    getReportsSummary: async (_, { project_id, type }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);
      const reports = project.reports;
      if (valid) {
        let summary = {
          New: 0,
          Minor: 0,
          Major: 0,
          Breaking: 0,
        };
        reports.forEach((rep) => {
          if (rep.category === type) {
            console.log(rep.severity);
            summary[rep.severity] = summary[rep.severity] + 1;
          }
        });
        return summary;
      } else {
        throw new Error("unauthorized");
      }
    },
    getTesterSummary: async (_, { project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);
      if (valid) {
        let summary = {
          sent: 0,
          feedback: 0,
          per: 0,
        };
        summary.feedback = project.reports.filter((rep) => {
          if (rep.created_by) {
            return rep.created_by.toHexString() === "5f8af6e460e9c03fa813752e";
          } else {
            return false;
          }
        }).length;
        summary.sent = project.guests.length;
        if (summary.sent !== 0) {
          summary.per =
            Math.round(
              (summary.feedback / summary.sent + Number.EPSILON) * 10
            ) / 10;
        }

        return summary;
      } else {
        throw new Error("unauthorized");
      }
    },
  },
  Mutation: {
    createProject: async (_, { title }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const owner = token.id;
      const exists = await User.findById(owner).exec();
      if (exists) {
        const project = new Project({
          title,
          owner,
        });
        const savedProject = await project.save();
        exists.projects.push(savedProject._id);
        await exists.save();
        return savedProject;
      } else {
        const err = { message: "user not found" };
        throw err;
      }
    },
    updateProject: async (
      _,
      { id, title, admin_email, guest_email },
      context
    ) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(id).exec();
      let { valid, role } = getProjectAuthStatus(token, project);
      if (valid) {
        if (role === "Owner") {
          if (title) {
            project.title = title;
          }
          if (admin_email) {
            const user = await User.findOne({ email: admin_email }).exec();
            if (user) {
              isOwner =
                project.owner.toHexString() == user._id.toHexString()
                  ? true
                  : false;
              isAdmin = project.admins.includes(user._id);
              isGuset = project.guests.includes(user._id);
              if (isAdmin || isOwner) {
                throw new Error(
                  `${admin_email} is already assigned to this project`
                );
              } else {
                project.admins.push(user._id);
                user.projects.push(id);
                user.save();
              }
            } else {
              throw new Error(
                `No User with email ${admin_email} has an Aardvark account`
              );
            }
          }
          if (guest_email) {
            //guest user pollyfill id
            const poly_id = "5f8af6e460e9c03fa813752e";
            const user = await User.findOne({ email: guest_email }).exec();
            isGuset = project.guests.includes(guest_email);
            if (user) {
              isOwner =
                project.owner.toHexString() == user._id.toHexString()
                  ? true
                  : false;
              isAdmin = project.admins.includes(user._id);
              if (isOwner) {
                throw new Error(`Why would you invite yourself.....`);
              }
              if (isAdmin) {
                throw new Error(`${guest_email} is a project member already.`);
              }
              if (isGuset) {
                // RESEND AN EMAIL HERE
                try {
                  let linkToken = getToken(
                    {
                      id: poly_id,
                      project_id: id,
                      email: guest_email,
                    },
                    "365d"
                  );
                  let link = `http://${process.env.FRONTEND_URL}/guest/create-report?token=${linkToken}`;
                  await sendMail({
                    to: guest_email,
                    link,
                    project_name: project.title,
                  });
                } catch (err) {
                  throw new Error(err.message);
                }
              }
              // NOT ON PROJECT PUSH TO PROJECT GUESTS AND SEND THE EMAIL HERE
              try {
                let linkToken = getToken(
                  {
                    id: poly_id,
                    project_id: id,
                    email: guest_email,
                  },
                  "365d"
                );
                let link = `http://${process.env.FRONTEND_URL}/guest/create-report?token=${linkToken}`;
                await sendMail({
                  to: guest_email,
                  link,
                  project_name: project.title,
                });
                project.guests.push(guest_email);
              } catch (err) {
                throw new Error(err.message);
              }
            }
            if (isGuset) {
              // RESEND AN EMAIL HERE
              try {
                let linkToken = getToken(
                  {
                    id: poly_id,
                    project_id: id,
                    email: guest_email,
                  },
                  "365d"
                );
                let link = `http://${process.env.FRONTEND_URL}/guest/create-report?token=${linkToken}`;
                await sendMail({
                  to: guest_email,
                  link,
                  project_name: project.title,
                });
              } catch (err) {
                throw new Error(err.message);
              }
            } else {
              // USER NOT IN SYSTEM PUSH EMAIL TO PROJECT GUESTS AND SEND EMAIL LINK
              try {
                let linkToken = getToken(
                  {
                    id: poly_id,
                    project_id: id,
                    email: guest_email,
                  },
                  "365d"
                );
                let link = `http://${process.env.FRONTEND_URL}/guest/create-report?token=${linkToken}`;
                await sendMail({
                  to: guest_email,
                  link,
                  project_name: project.title,
                });
                project.guests.push(guest_email);
              } catch (err) {
                throw new Error(err.message);
              }
            }
          }
          return project.save();
        } else {
          throw new Error("Only owners can update projects");
        }
      } else {
        throw new Error("Please relogin, something went wrong");
      }
    },
  },
  Subscripton: {},
};
