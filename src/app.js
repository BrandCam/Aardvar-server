const result = require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const middlewares = require("./middlewares/middlewares");
const typeDefs = require("./GraphQL/typeDefs");
const resolvers = require("./GraphQL/resolvers");

mongoose.connect(process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;

//logging db status
db.on("error", () => {
  console.log("> error occurred from the database");
});
db.once("open", () => {
  console.log("> successfully opened the database");
});

// api router
const api = require("./api");
const app = express();

//Connect Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
  context: async ({ req, connection }) => {
    if (connection) {
      return connection.context;
    } else {
      return { req };
    }
  },
  introspection: true,
  formatError: (err) => {
    if (err.message.startsWith("Database Error: ")) {
      return new Error("Internal server error");
    }
    return err;
  },
});

//before routes middlewares
app.use(morgan("dev"));

app.use(cors());
app.use(express.json());

// apply Apollo middleware
server.applyMiddleware({ app });
app.use(helmet());
// landing page routes
app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

//Rest api endpoints
app.use("/api/v1", api);

// Error middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
