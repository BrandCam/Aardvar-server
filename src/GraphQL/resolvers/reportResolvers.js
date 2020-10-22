const { get } = require("mongoose");
const Project = require("../../models/Projects");
const User = require("../../models/User");
const { getTokenFromContext, checkToken } = require("../../util/jwt");
const { getProjectAuthStatus, validateLogIn } = require("../../util/validate");

module.exports.reportResolver = {
  Query: {
    getReport: async (_, { id, project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();

      const { valid, role } = getProjectAuthStatus(token, project);
      const report = project.reports.find((e) => e._id.toHexString() === id);

      if (valid && (role === "Owner" || role === "Admin")) {
        return report;
      } else {
        throw new Error("You must be an Admin/Owner to veiw Report details.");
      }
    },
    getMyReports: async (_, { project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const { valid, role } = getProjectAuthStatus(token, project);

      if (valid && (role === "Owner" || role === "Admin")) {
        reports = project.reports.filter((report) =>
          report.worked_by.find((e) => e.toHexString() === token.id)
        );

        return reports;
      } else {
        throw new Error("You must be an Admin/Owner to veiw Report details.");
      }
    },
  },
  Mutation: {
    createReport: async (
      _,
      {
        project_id,
        category,
        img_urls,
        video_url,
        description,
        summary,
        severity,
        guest_creator,
      },
      context
    ) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const { valid, role } = getProjectAuthStatus(token, project);
      if (valid && (role === "Owner" || role === "Admin" || role === "Guest")) {
        project.reports.push({
          created_by: token.id,
          guest_creator: guest_creator ? guest_creator : null,
          category,
          severity,
          summary,
          description,
          img_urls,
          video_url,
          is_resolved: false,
        });
        updated = await project.save();
        return updated.reports.pop();
      } else {
        throw new Error("You must be a project member to create Reports");
      }
    },
    updateReport: async (
      _,
      {
        id,
        project_id,
        category,
        img_urls,
        video_url,
        is_resolved,
        description,
        summary,
        severity,
      },
      context
    ) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const { valid, role } = getProjectAuthStatus(token, project);
      const report = project.reports.find((e) => e._id.toHexString() === id);

      if (valid && (role === "Owner" || role === "Admin")) {
        if (category) {
          report.category = category;
        }
        if (img_urls) {
          report.img_urls = [...report.img_urls, ...img_urls];
        }
        if (video_url) {
          report.video_url = video_url;
        }
        if (is_resolved) {
          report.is_resolved = is_resolved;
        }
        if (description) {
          report.description = description;
        }
        if (summary) {
          report.summary = summary;
        }
        if (severity) {
          report.severity = severity;
        }
        await project.save();
        return report;
      } else {
        throw new Error("You must be an Admin/Owner to update Reports");
      }
    },
    pickUpReport: async (_, { id, project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const { valid, role } = getProjectAuthStatus(token, project);
      const report = project.reports.find((e) => e._id.toHexString() === id);
      if (valid && (role === "Owner" || role === "Admin")) {
        report.worked_by.push(token.id);
        await project.save();
        return report;
      } else {
        throw new Error("You must be an Admin/Owner to update Reports");
      }
    },
    dropReport: async (_, { id, project_id }, context) => {
      const token = checkToken(getTokenFromContext(context));
      const project = await Project.findById(project_id).exec();
      const { valid, role } = getProjectAuthStatus(token, project);
      const report = project.reports.find((e) => e._id.toHexString() === id);
      if (valid && (role === "Owner" || role === "Admin")) {
        newWorkedBy = [...report.worked_by].filter((id) => {
          return id.toHexString() !== token.id;
        });
        report.worked_by = newWorkedBy;
        project.save();

        return report;
      } else {
        throw new Error("You must be an Admin/Owner to update Reports");
      }
    },
  },
  Subscripton: {},
};
