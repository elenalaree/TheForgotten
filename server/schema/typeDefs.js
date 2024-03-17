import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    gender: String
  }

  type Query {
    users: [User]!
    user(id: ID!): User
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!, gender: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
  }
`;

export default typeDefs;
