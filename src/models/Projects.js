const mongoose = require("mongoose");
const projectSchema = require("./schemas").projectSchema;

module.exports = mongoose.model("Project", projectSchema);
