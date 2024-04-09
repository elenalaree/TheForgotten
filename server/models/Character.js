import { Schema, model } from 'mongoose';
import Class from './Class.js';
import User from './User.js'
const characterSchema = new Schema(
	{
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
		background: {
			type: String,
			required: true,
		},
		alignment: {
			type: String,
			required: true,
		},
		experiencePoints: {
			type: Number,
			required: true,
		},
		abilityScores: {
			strength: Number,
			dexterity: Number,
			constitution: Number,
			intelligence: Number,
			wisdom: Number,
			charisma: Number
		},
		proficiencies: {
			armor: [String],
			weapons: [String],
			skills: [String],
			tools: [String],
			languages: [String]
		},
		features: [String],
		equipment: [String],
		spells: {
			cantrips: [String],
			level1: [String]
		},
		hitPoints: {
			maxHP: Number,
			currentHP: Number,
			temporaryHP: Number
		},
		armorClass: Number,
		initiative: Number,
		speed: Number,
		hitDice: String,
		deathSaves: {
			successes: Number,
			failures: Number
		},
		personalityTraits: String,
		ideals: String,
		bonds: String,
		flaws: String,
		createdAt: Date,
		updatedAt: Date,
	},
	{
		toJSON: {
			virtuals: true,
		},
	}
);

const Character = model("Character", characterSchema);

export default Character;
