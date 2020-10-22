const { PubSub } = require("graphql-subscriptions");
const { ModuleLoader } = require("graphql-tools");

const pubsub = new PubSub();

module.exports = {
  pubsub,
};
