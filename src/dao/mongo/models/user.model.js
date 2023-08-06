import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	first_name: {
		type: String,
		require: true,
	},
	last_name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		unique: true,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	role: {
		type: String,
		default: "user",
		require: true,
	},
});

export const userModel = mongoose.model('Users', userSchema);
