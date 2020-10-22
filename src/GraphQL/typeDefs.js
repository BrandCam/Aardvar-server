const { gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Subscription {
    chatCommentAdded(project_id: ID!): Comment!
    commentAdded(project_id: ID!, report_id: ID!): Comment!
  }

  type Query {
    hello: String
    getUser(email: String!): User!
    getProject(id: ID!): Project!
    getChat(project_id: ID!): [Comment]
    logInUser(email: String!, password: String!): Token!
    getReport(id: ID!, project_id: ID!): Report!
    getMyReports(project_id: ID!): [Report]
    getReportsSummary(project_id: ID!, type: String!): Reports_Summary
    getTesterSummary(project_id: ID!): Tester_Summary
  }
  type Mutation {
    createUser(email: String!, password: String!, display_name: String!): Token!

    createProject(title: String!): Project!

    createComment(project_id: ID!, report_id: ID!, content: String!): Report!

    createChatComment(project_id: ID!, content: String!): [Comment]!

    createReport(
      project_id: ID!
      category: String!
      severity: String!
      summary: String!
      description: String!
      img_urls: [String]
      video_url: String
      guest_creator: String
    ): Report!

    pickUpReport(id: ID!, project_id: ID!): Report!

    dropReport(id: ID!, project_id: ID!): Report!

    updateUser(email: String, display_name: String): Token!

    updateProject(
      id: ID!
      title: String
      admin_email: String
      guest_email: String
    ): Project!

    updateReport(
      id: ID
      project_id: ID
      summary: String
      severity: String
      description: String
      img_urls: [String]
      video_url: String
      category: String
      is_resolved: Boolean
    ): Report!

    updateComment(
      id: ID!
      project_id: ID!
      report_id: ID!
      content: String
    ): Report!
  }

  type Token {
    token: String
  }

  type User {
    id: ID!
    email: String
    display_name: String
    projects: [Project]
    last_login: String
    createdAt: String
    updatedAt: String
  }

  type Comment {
    id: ID!
    author: User
    content: String
    createdAt: String
    updatedAt: String
  }

  type Report {
    id: ID!
    category: String
    severity: String
    summary: String
    description: String
    created_by: User
    guest_creator: String
    img_urls: [String]
    video_url: String
    comments: [Comment]
    is_resolved: Boolean
    worked_by: [User]
    createdAt: String
    updatedAt: String
  }

  type Reports {
    reports: [Report]
    length: Int
  }

  type Project {
    id: ID!
    title: String
    owner: User
    admins: [User]
    guests: [String]
    reports(
      severity: [String]
      category: String
      is_resolved: Boolean
      order: Int
      limit: Int
      page: Int
    ): Reports
    chat: [Comment]
    createdAt: String
    updatedAt: String
  }

  type Reports_Summary {
    New: Int
    Minor: Int
    Major: Int
    Breaking: Int
  }

  type Tester_Summary {
    sent: Int
    feedback: Int
    per: Float
  }
`;

module.exports = typeDefs;
