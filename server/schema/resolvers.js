import { User, Character, Class } from '../models/index.js';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { signToken } from '../utils/auth.js';
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
        getClass: async (_, { id }) => {
            try {
                // Find the class by ID
                const classData = await Class.findById(id);

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
        getCharacterSheet: async (_, args) => {
            // Fetch the CharacterSheet object from the database
            const characterSheet = await Character.findOne({ name: args.id });

            // Fetch the associated Class object from the database
            const dndClass = await ClassModel.findOne({ name: characterSheet.class });

            // Combine the CharacterSheet and Class objects and return
            return { ...characterSheet.toObject(), class: dndClass.toObject() };
        }
    },

    Mutation: {
        // User mutations below for creating users and logging in a user 
        addUser: async (parent, args) => {
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
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        logout: () => {
            //logout info will go here.
            return true;
        },
        //All Class info below here
        createClass: async (_, { input }) => {
            try {
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
                // Find the class by ID and update it
                const updatedClass = await Class.findOneAndUpdate(
                    { _id: id },
                    input,
                    { new: true } // Return the updated document
                );

                // If the class is not found, throw an error
                if (!updatedClass) {
                    throw new Error('Class not found.');
                }

                // Return the updated class
                return updatedClass;
            } catch (error) {
                // Handle any errors that occur during the update process
                throw new Error('Failed to update class: ' + error.message);
            }
        },
        deleteClass: async (_, { classId }) => {
            try {
                // Find the class by ID
                const deletedClass = await Class.findByIdAndDelete(classId);

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
    }
};

export default resolvers;