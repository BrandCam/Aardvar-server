const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = Schema(
  {
    email: String,
    password: String,
    display_name: String,
    projects: [{ type: ObjectId, ref: "Project" }],
    last_login: Date,
  },
  { timestamps: true }
);

const commentsSchema = mongoose.Schema(
  {
    author: { type: ObjectId, ref: "User" },
    content: String,
  },
  { timestamps: true }
);

const reportsSchema = mongoose.Schema(
  {
    category: String,
    description: String,
    summary: String,
    severity: String,
    created_by: { type: ObjectId, ref: "User" },
    guest_creator: String,
    img_urls: [String],
    video_url: String,
    comments: [{ type: commentsSchema }],
    is_resolved: Boolean,
    worked_by: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const projectSchema = mongoose.Schema(
  {
    title: String,
    owner: { type: ObjectId, ref: "User" },
    admins: [{ type: ObjectId, ref: "User" }],
    guests: [String],
    reports: [{ type: reportsSchema }],
    chat: [{ type: commentsSchema }],
  },
  { timestamps: true }
);

module.exports = {
  projectSchema,
  userSchema,
};
