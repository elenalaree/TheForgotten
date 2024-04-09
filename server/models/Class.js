import { Schema, model } from 'mongoose';

const classSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        hitDie: {
            type: String,
            required: true
        },
        primaryAbility: {
            type: String,
            required: true
        },
        savingThrow: {
            type: [String],
            required: true
        },
        proficiencies: {
            armor: {
                type: [String],
                required: true
            },
            weapons: {
                type: [String],
                required: true
            }
        },
    }
);

const Class = model('Class', classSchema);

export default Class;
