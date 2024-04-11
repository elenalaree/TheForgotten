import resolvers from "../schema/resolvers.js";
import { User, Character, Class, Game } from '../models/index.js';
import { signToken, authMiddleware, validateEmail } from '../utils/auth.js';
import { describe, expect, test } from '@jest/globals';
import { AuthenticationError } from 'apollo-server-express';

// Mocking the necessary modules
jest.mock('../models/index.js');
jest.mock('apollo-server-express');
jest.mock('../utils/auth', () => ({
    __esModule: true,
    signToken: jest.fn(),
  }));

// Define test suite
describe('Resolvers', () => {
    describe('Query', () => {
        describe('users', () => {
            test('should return all users', async () => {
                const mockedUsers = [{ _id: '1', username: 'user1' }, { _id: '2', username: 'user2' }];
                User.find.mockResolvedValue(mockedUsers);
                const result = await resolvers.Query.users();
                expect(result).toEqual(mockedUsers);
            });
        });

        describe('user', () => {
            test('should return a user by ID', async () => {
                const mockedUser = { _id: '1', username: 'user1' };
                User.findById.mockResolvedValue(mockedUser);
                const result = await resolvers.Query.user(null, { id: '1' });
                expect(result).toEqual(mockedUser);
            });

            test('should throw an error if user not found', async () => {
                User.findById.mockResolvedValue(null);
                await expect(resolvers.Query.user(null, { id: '999' })).rejects.toThrowError('User not found.');
            });
        });

        describe('getClasses', () => {
            test('should return all classes', async () => {
                const mockedClasses = [{ _id: '1', name: 'Class1' }, { _id: '2', name: 'Class2' }];
                Class.find.mockResolvedValue(mockedClasses);
                const result = await resolvers.Query.getClasses();
                expect(result).toEqual(mockedClasses);
            });
        });

        describe('getCharacters', () => {
            test('should return all characters', async () => {
                // Mocked characters data
                const mockedCharacters = [{ _id: '1', name: 'Character 1' }, { _id: '2', name: 'Character 2' }];
                Character.find.mockResolvedValue(mockedCharacters);

                // Call the resolver function
                const result = await resolvers.Query.getCharacters();

                // Assert that the resolver returns the mocked characters
                expect(result).toEqual(mockedCharacters);
            });

            test('should throw an error if fetching characters fails', async () => {
                // Mock the Character.find function to throw an error
                Character.find.mockRejectedValue(new Error('Database error'));

                // Assert that calling the resolver function throws an error
                await expect(resolvers.Query.getCharacters()).rejects.toThrowError('Failed to fetch characters: Database error');
            });
        });

        describe('getCharacter', () => {
            test('should return the character with the given ID', async () => {
                // Mocked character data
                const mockedCharacter = { _id: '1', name: 'Character 1' };
                const characterId = '1';
                Character.findById.mockResolvedValue(mockedCharacter);

                // Call the resolver function with the mocked character ID
                const result = await resolvers.Query.getCharacter(null, { characterId });

                // Assert that the resolver returns the mocked character
                expect(result).toEqual(mockedCharacter);
            });

            test('should throw an error if character not found', async () => {
                // Mock the Character.findById function to return null, indicating character not found
                Character.findById.mockResolvedValue(null);
                const characterId = '999'; // Some invalid character ID

                // Assert that calling the resolver function with an invalid character ID throws an error
                await expect(resolvers.Query.getCharacter(null, { characterId })).rejects.toThrowError('character not found.');
            });

            test('should throw an error if fetching character fails', async () => {
                // Mock the Character.findById function to throw an error
                Character.findById.mockRejectedValue(new Error('Database error'));
                const characterId = '1';

                // Assert that calling the resolver function throws an error
                await expect(resolvers.Query.getCharacter(null, { characterId })).rejects.toThrowError('Failed to fetch character: Database error');
            });
        });


        describe('games', () => {
            test('should return list of games', async () => {
                const mockGames = [{ _id: '1', name: 'game1' }, { _id: '2', name: 'game2' }];
                Game.find.mockResolvedValue(mockGames);
                const result = await resolvers.Query.games();
                expect(result).toEqual(mockGames);
            });

            test('should throw error if failed to fetch games', async () => {
                Game.find.mockRejectedValue(new Error('Database error'));
                await expect(resolvers.Query.games()).rejects.toThrow('Failed to fetch games: Database error');
            });
        });

        describe('game', () => {
            test('should return game by ID', async () => {
                const mockGame = { _id: '1', name: 'testgame' };
                Game.findById.mockResolvedValue(mockGame);
                const result = await resolvers.Query.game(null, { gameId: '1' });
                expect(result).toEqual(mockGame);
            });

            test('should throw error if game not found', async () => {
                Game.findById.mockResolvedValue(null);
                await expect(resolvers.Query.game(null, { gameId: '1' })).rejects.toThrow('Game not found.');
            });
        });
    });

    describe('Mutation', () => {
        describe('addUser', () => {
            test('should create user and return token and user object', async () => {
                // Mocked input data
                const args = {
                    username: 'Randy',
                    email: 'Messy@example.com',
                    password: 'password',
                };
                // Mocked user object returned by the create function
                const mockedUser = { _id: '1', ...args };
                User.findOne.mockResolvedValue(null); // Mock user not found
                User.create.mockResolvedValue(mockedUser);
                
                // Mock the signToken function
                const mockToken = 'mockToken';
                jest.spyOn(signToken, 'signToken').mockImplementation((user) => { // Ensure signToken is accessed correctly
                    return mockToken;
                });
                
                // Call the resolver function with the mocked input
                const result = await resolvers.Mutation.addUser(null, args);
                
                // Assert that the resolver returns the expected token and user object
                expect(result).toEqual({ token: mockToken, user: mockedUser });
                
                // Assert that the User.create function was called with the correct arguments
                expect(User.create).toHaveBeenCalledWith(args);
                
                // Assert that the signToken function was called with the created user
                expect(signToken.mockToken).toHaveBeenCalledWith(mockedUser); // Ensure correct method is accessed
            });


            test('should throw an error if email already exists', async () => {
                // Mocked input data with an existing email
                const args = {
                    username: 'Randy',
                    email: 'Messy@example.com',
                    password: 'password',
                };
                User.findOne.mockResolvedValue({ _id: '2', email: 'Messy@example.com' }); // Mock existing user

                // Assert that calling the resolver function with the mocked input throws an error
                await expect(resolvers.Mutation.addUser(null, args)).rejects.toThrowError('Email already exists.');

                // Assert that the User.findOne function was called with the correct email
                expect(User.findOne).toHaveBeenCalledWith({ email: args.email });
            });

            test('should throw an error if password is too short', async () => {
                // Mocked input data with a short password
                const args = {
                    username: 'Blahlb',
                    email: 'testy@exmple.com',
                    password: '12345',
                };
                console.log(args)
                // Assert that calling the resolver function with the mocked input throws an error
                await expect(resolvers.Mutation.addUser(null, args)).rejects.toThrowError('Password must be at least 6 characters long.');
            });
        });

        describe('updateUser', () => {
            test('should update user information and return updated user object', async () => {
                const mockUpdatedUser = { _id: '1', username: 'updatedUser', email: 'updated@example.com', gender: 'female' };
                User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);
                const result = await resolvers.Mutation.updateUser(null, { id: '1', input: mockUpdatedUser });
                expect(result).toEqual(mockUpdatedUser);
            });

            test('should throw error if user not found', async () => {
                User.findByIdAndUpdate.mockResolvedValue(null);
                await expect(resolvers.Mutation.updateUser(null, { id: '1', input: {} })).rejects.toThrow('User not found.');
            });
        });

        describe('deleteUser', () => {
            test('should delete user and return deleted user object', async () => {
                const mockDeletedUser = { _id: '1', username: 'deletedUser', email: 'deleted@example.com', gender: 'non-binary' };
                User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);
                const result = await resolvers.Mutation.deleteUser(null, { id: '1' });
                expect(result).toEqual(mockDeletedUser);
            });

            test('should throw error if user not found', async () => {
                User.findByIdAndDelete.mockResolvedValue(null);
                await expect(resolvers.Mutation.deleteUser(null, { id: '1' })).rejects.toThrow('User not found.');
            });
        });

        describe('login', () => {
            test('should successfully login and return token and user', async () => {
                // Mock input data
                const email = 'test@example.com';
                const password = 'password';
        
                // Mock user data
                const user = { _id: '1', email };
        
                // Mock User.findOne to resolve with user data
                User.findOne.mockResolvedValue(user);
        
                // Mock user.isCorrectPassword to return true
                user.isCorrectPassword.mockResolvedValue(true);
        
                // Mock signToken to return a token
                const token = 'mockToken';
                signToken.mockReturnValue(token);
        
                // Call the resolver function
                const result = await resolvers.Mutation.login(null, { email, password });
        
                // Assertions
                expect(result).toEqual({ token, user }); // Ensure the resolver returns the expected token and user
                expect(User.findOne).toHaveBeenCalledWith({ email }); // Ensure User.findOne was called with the correct email
                expect(validateEmail).toHaveBeenCalledWith(email); // Ensure validateEmail was called with the correct email
                expect(user.isCorrectPassword).toHaveBeenCalledWith(password); // Ensure isCorrectPassword was called with the correct password
                expect(signToken).toHaveBeenCalledWith(user); // Ensure signToken was called with the user object
            });

            test('should throw AuthenticationError if user not found', async () => {
                User.findOne.mockResolvedValue(null);
                await expect(resolvers.Mutation.login(null, { email: 'invalid@example.com', password: 'password' })).rejects.toThrow('Incorrect credentials');
            });

            test('should throw AuthenticationError if password is incorrect', async () => {
                const mockUser = { _id: '1', email: 'test@example.com', password: 'password' };
                User.findOne.mockResolvedValue(mockUser);
                await expect(resolvers.Mutation.login(null, { email: 'test@example.com', password: 'incorrectPassword' })).rejects.toThrow('Incorrect credentials');
            });
        })
        describe('addClass', () => {
            test('should create a new class', async () => {
                const input = { name: 'Warrior', description: 'A powerful fighter' };
                const mockedClass = { _id: '1', ...input };
                Class.create.mockResolvedValue(mockedClass);
                const result = await resolvers.Mutation.createClass(null, { input });
                expect(result).toEqual(mockedClass);
            });
        });
        describe('updateClass', () => {
            test('should update class and return updated class object', async () => {
                // Mocked input data
                const id = '1';
                const input = {
                    name: 'Updated Class Name',
                    description: 'Updated class description',
                    hitDie: 'd12',
                    primaryAbility: 'Strength',
                    savingThrow: ['Strength', 'Constitution'],
                    proficiencies: {
                        armor: ['Light Armor', 'Medium Armor'],
                        weapons: ['Sword', 'Axe'],
                    },
                };
                // Mocked existing class object
                const existingClass = { _id: id, name: 'Old Class Name', description: 'Old class description', hitDie: 'd10', /* other fields */ };

                // Mock the Class.findById method to return the existing class object
                Class.findById.mockResolvedValueOnce(existingClass);

                // Mock the Class.findByIdAndUpdate method to return the updated class object
                Class.findByIdAndUpdate.mockResolvedValueOnce({ _id: id, ...input });

                // Call the resolver function with the mocked input
                const result = await resolvers.Mutation.updateClass(null, { id, input });

                // Assert that the resolver returns the updated class object
                expect(result).toEqual({ _id: id, ...input });

                // Assert that the Class.findByIdAndUpdate method was called with the correct arguments
                expect(Class.findByIdAndUpdate).toHaveBeenCalledWith(id, input, { new: true });
            });

            test('should throw error if class not found', async () => {
                // Mock the Class.findById method to return null, indicating class not found
                Class.findById.mockResolvedValueOnce(null);

                // Call the resolver function with some id and input
                const id = '999'; // Some invalid id
                const input = { /* some input */ };

                // Assert that the resolver throws an error indicating class not found
                await expect(resolvers.Mutation.updateClass(null, { id, input })).rejects.toThrowError('Class not found.');
            });

            test('should throw error if no fields are provided for update', async () => {
                // Mock the Class.findById method to return some existing class object
                const existingClass = { _id: '1', name: 'Existing Class Name', /* other fields */ };
                Class.findById.mockResolvedValueOnce(existingClass);

                // Call the resolver function with an empty input object
                const id = '1';
                const input = {};

                // Assert that the resolver throws an error indicating at least one field is required for updating a class
                await expect(resolvers.Mutation.updateClass(null, { id, input })).rejects.toThrowError('At least one field is required for updating a class');
            });

            describe('deleteClass', () => {
                test('should delete class and return deleted class object', async () => {
                    // Mocked existing class object
                    const id = '1';
                    const existingClass = { _id: id, name: 'Existing Class Name', /* other fields */ };

                    // Mock the Class.findByIdAndDelete method to return the deleted class object
                    Class.findByIdAndDelete.mockResolvedValueOnce(existingClass);

                    // Call the resolver function with the class ID to delete
                    const result = await resolvers.Mutation.deleteClass(null, { id });

                    // Assert that the resolver returns the deleted class object
                    expect(result).toEqual(existingClass);

                    // Assert that the Class.findByIdAndDelete method was called with the correct argument (class ID)
                    expect(Class.findByIdAndDelete).toHaveBeenCalledWith(id);
                });

                test('should throw error if class not found', async () => {
                    // Mock the Class.findByIdAndDelete method to return null, indicating class not found
                    Class.findByIdAndDelete.mockResolvedValueOnce(null);

                    // Call the resolver function with some id
                    const id = '999'; // Some invalid id

                    // Assert that the resolver throws an error indicating class not found
                    await expect(resolvers.Mutation.deleteClass(null, { id })).rejects.toThrowError('Class not found.');
                });

                // Additional test cases can be added if there are other scenarios to cover
            });
            describe('createCharacter', () => {
                test('should create a new character', async () => {
                    const input = { characterName: 'Char1', userId: '1', race: 'Human', class: '1', level: 1 };
                    const mockedCharacter = { _id: '1', ...input };
                    Character.create.mockResolvedValue(mockedCharacter);
                    User.findByIdAndUpdate.mockResolvedValue(null); // Mocking the user update call
                    const result = await resolvers.Mutation.createCharacter(null, { input });
                    expect(result).toEqual(mockedCharacter);
                });
            });
            describe('updateCharacter', () => {
                test('should update character and return updated character object', async () => {
                    // Mocked input data
                    const id = '1';
                    const inputData = {
                        characterName: 'Updated Character Name',
                        attributes: {
                            strength: 18,
                            dexterity: 16,
                            constitution: 14,
                            intelligence: 12,
                            wisdom: 10,
                            charisma: 8,
                        },
                        skills: {
                            acrobatics: 3,
                            athletics: 4,
                            stealth: 5,
                            arcana: 2,
                            history: 1,
                            insight: 3,
                            perception: 4,
                            performance: 2,
                            survival: 3,
                        },
                    };
                    // Mocked updated character object
                    const updatedCharacter = { _id: id, ...inputData };

                    // Mock the Character.findByIdAndUpdate method to return the updated character
                    Character.findByIdAndUpdate.mockResolvedValueOnce(updatedCharacter);

                    // Call the resolver function with the mocked input
                    const result = await resolvers.Mutation.updateCharacter(null, { id, inputData });

                    // Assert that the resolver returns the updated character object
                    expect(result).toEqual(updatedCharacter);

                    // Assert that the Character.findByIdAndUpdate method was called with the correct arguments
                    expect(Character.findByIdAndUpdate).toHaveBeenCalledWith(id, inputData, { new: true });
                });

                test('should throw error if character not found', async () => {
                    // Mock the Character.findByIdAndUpdate method to return null, indicating character not found
                    Character.findByIdAndUpdate.mockResolvedValueOnce(null);

                    // Call the resolver function with some id and input
                    const id = '999'; // Some invalid id
                    const input = { inputData };

                    // Assert that the resolver throws an error indicating character not found
                    await expect(resolvers.Mutation.updateCharacter(null, { id, input })).rejects.toThrowError('Character not found.');
                });

                test('should throw error if character ID is not provided', async () => {
                    // Call the resolver function without providing a character ID
                    const id = null;
                    const input = {
                        characterName: 'Updated Character Name',
                        attributes: {
                            strength: 18,
                            dexterity: 16,
                            constitution: 14,
                            intelligence: 12,
                            wisdom: 10,
                            charisma: 8,
                        },
                        skills: {
                            acrobatics: 3,
                            athletics: 4,
                            stealth: 5,
                            arcana: 2,
                            history: 1,
                            insight: 3,
                            perception: 4,
                            performance: 2,
                            survival: 3,
                        },
                    };

                    // Assert that the resolver throws an error indicating character ID must be provided
                    await expect(resolvers.Mutation.updateCharacter(null, { id, input })).rejects.toThrowError('Character ID must be provided');
                });

                test('should throw error if no fields are provided for update', async () => {
                    // Call the resolver function with an empty input object
                    const id = '1';
                    const input = {};

                    // Assert that the resolver throws an error indicating at least one field must be provided for update
                    await expect(resolvers.Mutation.updateCharacter(null, { id, input })).rejects.toThrowError('At least one field must be provided for update');
                });

            });
            // Add more tests for other Mutation resolvers if needed

        })
    })
});
