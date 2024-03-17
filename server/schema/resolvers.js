import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { signToken } from '../utils/auth.js';
import { AuthenticationError } from 'apollo-server-express';


const resolvers = {
    Query: {
        users: async ( parent, args ) =>
        {
            return await User.find( {} )
        },

        user: async ( parent, args ) =>
        {
            const userData = await User.findOne( {} )
                .select( '__v-password' )

            return userData
        }
    },

    Mutation: {
        // User mutations below for creating users and logging in a user 
        addUser: async ( parent, args ) =>
        {
            const user = await User.create( args );
            const token = signToken( user );

            return { token, user };
        },
        login: async ( parent, { email, password } ) =>
        {
            const user = await User.findOne( { email } );

            if( !user ) {
                throw new AuthenticationError( 'Incorrect credentials' );
            }

            const correctPw = await user.isCorrectPassword( password );

            if( !correctPw ) {
                throw new AuthenticationError( 'Incorrect credentials' );
            }

            const token = signToken( user );
            return { token, user };
        }
    }
};

export default resolvers;