import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: [/.+@.+\..+/, "Must match an email address!"],
		},
		password: {
			type: String,
			required: true,
			minlength: 5,
		},
        gender: {
            type: String,
		},
		characters: [{
            type: Schema.Types.ObjectId,
            ref: 'Character' // Reference to the Character model
        }],
		createdAt: Date,
		updatedAt: Date,
	},
	{
		toJSON: {
			virtuals: true,
		},
	}
);

// set up pre-save middleware to create password
userSchema.pre("save", async function (next) {
	if (this.isNew || this.isModified("password")) {
		const saltRounds = 10;
		this.password = await bcrypt.hash(this.password, saltRounds);
	}

	next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

export default User;
