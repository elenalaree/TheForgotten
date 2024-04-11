import { User, Character, Class, Game } from '../models/index.js';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { signToken, validateEmail } from '../utils/auth.js';
import { AuthenticationError } from 'apollo-server-express';


const resolvers = {
    Query: {
        users: async (parent, args) => {
            return await User.find({})
        },
        user: async (_, { id }) => {
            try {
                // Find the user by ID
                const userData = await User.findById(id);

                // If the user is not found, throw an error
                if (!userData) {
                    throw new Error('User not found.');
                }

                // Return the user data
                return userData;
            } catch (error) {
                // Handle any errors that occur during the process
                throw new Error('Failed to fetch user: ' + error.message);
            }
        },
        getClasses: async (_, args) => {
            return await Class.find({})
        },
        getClass: async (_, { singleId }) => {
            try {
                // Find the class by ID
                const classData = await Class.findById(singleId);

                // If the class is not found, return null
                if (!classData) {
                    return null;
                }

                // Return the class data
                return classData;
            } catch (error) {
                // Handle any errors that occur during the operation
                throw new Error('Failed to get class: ' + error.message);
            }
        },
        getCharacters: async () => {
            try {
                return await Character.find();
            } catch (error) {
                throw new Error('Failed to fetch characters: ' + error.message);
            }
        },
        getCharacter: async (_, { characterId }) => {
            try {
                const character = await Character.findById(characterId);
                if (!character) {
                    throw new Error('character not found.');
                }
                return character;
            } catch (error) {
                throw new Error('Failed to fetch character: ' + error.message);
            }
        },
        games: async () => {
            try {
                return await Game.find();
            } catch (error) {
                throw new Error('Failed to fetch games: ' + error.message);
            }
        },
        game: async (_, { gameId }) => {
            try {
                console.log(gameId);
                const game = await Game.findById(gameId);
                console.log(game)
                if (!game) {
                    throw new Error('Game not found.');
                }
                return game;
            } catch (error) {
                throw new Error('Failed to fetch game: ' + error.message);
            }
        },
    },

    Mutation: {
        // User mutations below for creating users and logging in a user 
        addUser: async (parent, args) => {
            // Validate input data (e.g., check for uniqueness, password complexity)
            const { username, email, password } = args;
        
            // Example validation: Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email already exists.');
            }
        
            // Example validation: Check if password meets complexity requirements
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long.');
            }
        
            // If input data is valid, create the user
            const user = await User.create(args);
            const token = signToken(user);
        
            return { token, user };
        },
        updateUser: async (_, { id, input }) => {
            try {
                // Find the user by ID and update their information
                const updatedUser = await User.findByIdAndUpdate(id, input, { new: true });

                // If the user is not found, throw an error
                if (!updatedUser) {
                    throw new Error('User not found.');
                }

                // Return the updated user object
                return updatedUser;
            } catch (error) {
                // Handle any errors that occur during the update process
                throw new Error('Failed to update user: ' + error.message);
            }
        },
        deleteUser: async (_, { id }) => {
            try {

                // Find the user by ID and delete it
                const deletedUser = await User.findByIdAndDelete(id);

                // If the user is not found, throw an error
                if (!deletedUser) {
                    throw new Error('User not found.');
                }

                // Return the deleted user object
                return deletedUser;
            } catch (error) {
                // Handle any errors that occur during the deletion process
                throw new Error('Failed to delete user: ' + error.message);
            }
        },
        login: async (parent, { email, password }) => {
            try {
                // Validate email format
                if (!validateEmail(email)) {
                    throw new UserInputError('Invalid email format');
                }
        
                // Find the user by email
                const user = await User.findOne({ email });
        
                // If no user is found, throw an authentication error
                if (!user) {
                    throw new AuthenticationError('Incorrect credentials');
                }
        
                // Verify password
                const correctPw = await user.isCorrectPassword(password);
        
                // If password is incorrect, throw an authentication error
                if (!correctPw) {
                    throw new AuthenticationError('Incorrect credentials');
                }
        
                // Generate token
                const token = signToken(user);
        
                // Return token and user
                return { token, user };
            } catch (error) {
                // Handle validation errors
                throw new Error('Failed to login: ' + error.message);
            }
        },
        logout: () => {
            //logout info will go here.
            return true;
        },
        //All Class info below here
        createClass: async (_, { input }) => {
            try {
                // Validate input data
                if (!input.name || !input.description || !input.hitDie || !input.primaryAbility || !input.savingThrow || !input.proficiencies) {
                    throw new UserInputError('All fields are required for creating a class');
                }
                
                // Create a new class object using the input data
                const newClass = await Class.create(input);
        
                // Return the newly created class object
                return newClass;
            } catch (error) {
                // Handle any errors that occur during database interaction
                throw new Error('Failed to create class: ' + error.message);
            }
        },
        updateClass: async (_, { id, input }) => {
            try {
                // Validate input data
                if (!input.name && !input.description && !input.hitDie && !input.primaryAbility && !input.savingThrow && !input.proficiencies) {
                    throw new UserInputError('At least one field is required for updating a class');
                }
        
                // Find the class by ID
                const existingClass = await Class.findById(id);
                if (!existingClass) {
                    throw new Error('Class not found.');
                }
        
                // Update the class
                const updatedClass = await Class.findByIdAndUpdate(id, input, { new: true });
        
                // Return the updated class
                return updatedClass;
            } catch (error) {
                // Handle any errors that occur during the update process
                throw new Error('Failed to update class: ' + error.message);
            }
        },
        deleteClass: async (_, { id }) => {
            try {
                // Find the class by ID
                const deletedClass = await Class.findByIdAndDelete(id);
        
                // If the class is not found, throw an error
                if (!deletedClass) {
                    throw new Error('Class not found.');
                }
        
                // Return the deleted class object
                return deletedClass;
            } catch (error) {
                // Handle any errors that occur during the deletion process
                throw new Error('Failed to delete class: ' + error.message);
            }
        },
        createCharacter: async (_, { input }) => {
            try {
                // Validate required fields
                if (!input.characterName || !input.userId || !input.race || !input.class || !input.level || !input.attributes || !input.skills || !input.equipment || !input.spells || !input.games) {
                    throw new UserInputError('All fields are required to create a character');
                }
        
                // Validate attributes
                const { strength, dexterity, constitution, intelligence, wisdom, charisma } = input.attributes;
                if (!Number.isInteger(strength) || !Number.isInteger(dexterity) || !Number.isInteger(constitution) || !Number.isInteger(intelligence) || !Number.isInteger(wisdom) || !Number.isInteger(charisma)) {
                    throw new UserInputError('Attributes must be integers');
                }
        
                // Validate skills
                const { acrobatics, athletics, stealth, arcana, history, insight, perception, performance, survival } = input.skills;
                if (acrobatics !== undefined && !Number.isInteger(acrobatics)) {
                    throw new UserInputError('Acrobatics skill must be an integer');
                }
        
                // Create a new character object using the input data
                const newCharacter = await Character.create(input);
        
                // Add the character's ID to the corresponding player's list of characters
                await User.findByIdAndUpdate(input.userId, {
                    $addToSet: { characters: newCharacter._id },
                });
        
                // Return the newly created character object
                return newCharacter;
            } catch (error) {
                // Handle any errors that occur during database interaction
                throw new Error('Failed to create character: ' + error.message);
            }
        },
        updateCharacter: async (_, { id, input }) => {
            try {
                // Validate that character ID is provided
                if (!id) {
                    throw new UserInputError('Character ID must be provided');
                }
        
                // Validate that at least one field is provided for update
                if (Object.keys(input).length === 0) {
                    throw new UserInputError('At least one field must be provided for update');
                }
        
                // Validate attributes
                if (input.attributes) {
                    const { strength, dexterity, constitution, intelligence, wisdom, charisma } = input.attributes;
                    if (strength !== undefined && !Number.isInteger(strength)) {
                        throw new UserInputError('Strength must be an integer');
                    }
                    if (dexterity !== undefined && !Number.isInteger(dexterity)) {
                        throw new UserInputError('Dexterity must be an integer');
                    }
                    if (constitution !== undefined && !Number.isInteger(constitution)) {
                        throw new UserInputError('Constitution must be an integer');
                    }
                    if (intelligence !== undefined && !Number.isInteger(intelligence)) {
                        throw new UserInputError('Intelligence must be an integer');
                    }
                    if (wisdom !== undefined && !Number.isInteger(wisdom)) {
                        throw new UserInputError('Wisdom must be an integer');
                    }
                    if (charisma !== undefined && !Number.isInteger(charisma)) {
                        throw new UserInputError('Charisma must be an integer');
                    }
                }
        
                // Validate skills
                if (input.skills) {
                    const { acrobatics, athletics, stealth, arcana, history, insight, perception, performance, survival } = input.skills;
                    if (acrobatics !== undefined && !Number.isInteger(acrobatics)) {
                        throw new UserInputError('Acrobatics skill must be an integer');
                    }
                    if (athletics !== undefined && !Number.isInteger(athletics)) {
                        throw new UserInputError('Athletics skill must be an integer');
                    }
                    if (stealth !== undefined && !Number.isInteger(stealth)) {
                        throw new UserInputError('Stealth skill must be an integer');
                    }
                    if (arcana !== undefined && !Number.isInteger(arcana)) {
                        throw new UserInputError('Arcana skill must be an integer');
                    }
                    if (history !== undefined && !Number.isInteger(history)) {
                        throw new UserInputError('History skill must be an integer');
                    }
                    if (insight !== undefined && !Number.isInteger(insight)) {
                        throw new UserInputError('Insight skill must be an integer');
                    }
                    if (perception !== undefined && !Number.isInteger(perception)) {
                        throw new UserInputError('Perception skill must be an integer');
                    }
                    if (performance !== undefined && !Number.isInteger(performance)) {
                        throw new UserInputError('Performance skill must be an integer');
                    }
                    if (survival !== undefined && !Number.isInteger(survival)) {
                        throw new UserInputError('Survival skill must be an integer');
                    }
                }
        
                // Find the Character by ID and update it
                const updatedCharacter = await Character.findByIdAndUpdate(id, input, { new: true });
        
                // If the Character is not found, throw an error
                if (!updatedCharacter) {
                    throw new Error('Character not found.');
                }
        
                // Return the updated Character
                return updatedCharacter;
            } catch (error) {
                // Handle any errors that occur during the update process
                throw new Error('Failed to update Character: ' + error.message);
            }
        },
        deleteCharacter: async (_, { id }) => {
            try {
                console.log(id)
                // Find the Character by ID
                const deletedCharacter = await Character.findByIdAndDelete(id);

                // If the Character is not found, throw an error
                if (!deletedCharacter) {
                    throw new Error('Character not found.');
                }

                // Return the deleted gmae object
                return deletedCharacter;
            } catch (error) {
                // Handle any errors that occur during the deletion process
                throw new Error('Failed to delete Character: ' + error.message);
            }
        },
        createGame: async (_, { input }) => {
            try {
                // Validate required fields
                if (!input.gameName) {
                    throw new UserInputError('Game name is required');
                }
                if (!input.dungeonMaster) {
                    throw new UserInputError('Dungeon master ID is required');
                }
        
                // Validate players and characters
                if (input.players && !Array.isArray(input.players)) {
                    throw new UserInputError('Players must be an array');
                }
                if (input.characters && !Array.isArray(input.characters)) {
                    throw new UserInputError('Characters must be an array');
                }
        
                // Create the game
                const game = await Game.create(input);
                return game;
            } catch (error) {
                throw new Error('Failed to create game: ' + error.message);
            }
        },
        updateGame: async (_, { id, input }) => {
            try {
                // Validate if game ID exists
                const existingGame = await Game.findById(id);
                if (!existingGame) {
                    throw new UserInputError('Game not found.');
                }
        
                // Validate optional fields
                if (input.players && !Array.isArray(input.players)) {
                    throw new UserInputError('Players must be an array');
                }
                if (input.characters && !Array.isArray(input.characters)) {
                    throw new UserInputError('Characters must be an array');
                }
        
                // Update the game
                const updatedGame = await Game.findOneAndUpdate(
                    { _id: id },
                    input,
                    { new: true } // Return the updated document
                );
        
                // If the Game is not found after update, throw an error
                if (!updatedGame) {
                    throw new Error('Failed to update game.');
                }
        
                // Return the updated Game
                return updatedGame;
            } catch (error) {
                // Handle any errors that occur during the update process
                throw new Error('Failed to update game: ' + error.message);
            }
        },
        deleteGame: async (_, { id }) => {
            try {
                console.log(id)
                // Find the Game by ID
                const deletedGame = await Game.findByIdAndDelete(id);

                // If the Game is not found, throw an error
                if (!deletedGame) {
                    throw new Error('Game not found.');
                }

                // Return the deleted gmae object
                return deletedGame;
            } catch (error) {
                // Handle any errors that occur during the deletion process
                throw new Error('Failed to delete game: ' + error.message);
            }
        },
    }
};

export default resolvers;