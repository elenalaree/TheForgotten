import { Schema, model } from 'mongoose';

const characterSchema = new Schema({
    characterName: {
        type: String,
        required: true,
        unique: true,
    },
	userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    race: {
        type: String,
        required: true,
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
    },
    level: {
        type: Number,
        required: true,
    },
    attributes: {
        strength: Number,
        dexterity: Number,
        constitution: Number,
        intelligence: Number,
        wisdom: Number,
        charisma: Number
    },
    skills: {
        acrobatics: Number,
        athletics: Number,
        stealth: Number,
        arcana: Number,
        history: Number,
        insight: Number,
        perception: Number,
        performance: Number,
        survival: Number
    },
    equipment: [String],
    spells: [String],
    games: [{
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }]
});

const Character = model("Character", characterSchema);

export default Character;
