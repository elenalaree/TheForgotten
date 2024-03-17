import { ApolloServer } from 'apollo-server-express'; 
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import cors from 'cors';
import { typeDefs, resolvers } from './schema/index.js';
import connectToDatabase from './config/connection.js';

async function startServer() {
  await connectToDatabase();

  const app = express();
  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: app })], // Add plugin
  });

  await server.start(); // Start the Apollo server

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
    
  });
}

startServer();
