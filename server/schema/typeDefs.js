import { gql } from 'apollo-server-express';

const typeDefs = gql`

  type User {
    _id: ID!
    username: String
    email: String
    gender: String
    characters: [Character]
  }

  type Query {
    users: [User]!
    user(id: ID!): User
    getClasses: [Class!]! 
    getClass(singleId: ID!): Class
    getCharacters: [Character!]!
    getCharacter(characterId: ID!): Character
    games: [Game!]!
    game(gameId: ID!): Game
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

  type Character {
    _id: ID!
    characterName: String!
    userId: ID! # Reference to the User who owns this character
    race: String!
    class: ID! # Reference to the Class of this character
    level: Int!
    attributes: CharacterAttributes!
    skills: CharacterSkills!
    equipment: [String!]!
    spells: [String!]!
    games: [ID!] # Reference to the games this character belongs to

  }

  input CharacterInput {
    characterName: String!
    userId: ID!
    race: String!
    class: ID!
    level: Int!
    attributes: CharacterAttributesInput!
    skills: CharacterSkillsInput!
    equipment: [String!]!
    spells: [String!]!
    games: [ID!]
  }
  
  input updatedCharacterInput {
    characterName: String
    userId: ID
    race: String
    class: ID
    level: Int
    attributes: CharacterAttributesInput
    skills: CharacterSkillsInput
    equipment: [String!]
    spells: [String!]
    games: [ID!]
  }

  type CharacterAttributes {
    strength: Int!
    dexterity: Int!
    constitution: Int!
    intelligence: Int!
    wisdom: Int!
    charisma: Int!
  }

  input CharacterAttributesInput {
    strength: Int!
    dexterity: Int!
    constitution: Int!
    intelligence: Int!
    wisdom: Int!
    charisma: Int!
  }
  
  type CharacterSkills {
    acrobatics: Int
    athletics: Int
    stealth: Int
    arcana: Int
    history: Int
    insight: Int
    perception: Int
    performance: Int
    survival: Int
  }

  input CharacterSkillsInput {
    acrobatics: Int
    athletics: Int
    stealth: Int
    arcana: Int
    history: Int
    insight: Int
    perception: Int
    performance: Int
    survival: Int
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


  input updatedClassInput {
    name: String
    description: String
    hitDie: String
    primaryAbility: String
    savingThrow: [String!]
    proficiencies: updatedProficienciesInput
  }
  input updatedProficienciesInput {
    armor: [String!]
    weapons: [String!]
  }

  input UserInput {
    username: String
    email: String
    password: String
    gender: String
  }

  type Game {
    _id: ID
    gameName: String!
    dungeonMaster: ID!
    players: [ID!]
    characters: [ID!]
    description: String
  }
  input GameInput {
    gameName: String!
    dungeonMaster: ID!
    players: [ID!]
    characters: [ID!]
    description: String
  }

  input updatedGameInput {
    gameName: String
    dungeonMaster: ID
    players: [ID!]
    characters: [ID!]
    description: String
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!, gender: String!): AuthPayload
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): User!
    login(email: String!, password: String!): AuthPayload
    logout: Boolean!
    createClass(input: ClassInput!): Class!
    updateClass(id: ID!, input: updatedClassInput!): Class!
    deleteClass(id: ID!): Class! 
    createCharacter(input: CharacterInput!): Character!
    updateCharacter(id: ID!, input: updatedCharacterInput!): Character!
    deleteCharacter(id: ID!): Character!
    createGame(input: GameInput!): Game!
    updateGame(id: ID!, input: updatedGameInput!): Game!
    deleteGame(id: ID!): Game!
  }
`;

export default typeDefs;
