const app = require("./app");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");

const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("graphql-tools");
const typeDefs = require("./GraphQL/typeDefs");
const resolvers = require("./GraphQL/resolvers");

const server = createServer(app);
const Schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  /* subscription server settings */
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: Schema,
    },
    {
      server: server,
      path: "/graphql",
    }
  );
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});