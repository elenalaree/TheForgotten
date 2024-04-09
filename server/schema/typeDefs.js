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
    getClasses: [Class!]! 
    getClass(id: ID!): Class
    getCharacterSheet: CharacterSheet!
  }

  type AuthPayload {
    token: String
    user: User
  }
  
  type Class {
    _id: ID
    name: String!
    description: String!
    hitDie: String!
    primaryAbility: String!
    savingThrow: [String!]!
    proficiencies: Proficiencies!
  }
  
  type Proficiencies {
    armor: [String!]!
    weapons: [String!]!
  }

  type CharacterSheet {
    # Define fields for a character sheet
    # Example fields: name, level, race, class, etc.
    name: String!
  }

  input ClassInput {
    name: String!
    description: String!
    hitDie: String!
    primaryAbility: String!
    savingThrow: [String!]!
    proficiencies: ProficienciesInput!
  }
  
  input ProficienciesInput {
    armor: [String!]!
    weapons: [String!]!
  }

  input UserInput {
    # Define fields that can be updated for a user
    username: String
    email: String
    password: String
    gender: String
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!, gender: String!): AuthPayload
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): User!
    login(email: String!, password: String!): AuthPayload
    logout: Boolean!
    createClass(input: ClassInput!): Class!
    updateClass(id: ID!, input: ClassInput!): Class! # Fixed typo here
    deleteClass(id: ID!): Class! 
  }
`;

export default typeDefs;
