import { Schema, model } from 'mongoose';

const gameSchema = new Schema({
    gameName: {
        type: String,
        required: true,
        unique: true,
    }, 
    dungeonMaster: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User who is the Dungeon Master of this game
        required: true,
    },
    players: [{
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the Users who are playing in this game
    }],
    characters: [{
        type: Schema.Types.ObjectId,
        ref: 'Character', // Reference to the Characters who are part of this game
    }],
    description: String,
});

const Game = model("Game", gameSchema);

export default Game;
