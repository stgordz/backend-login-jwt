import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
	email: {
		type: String,
		require: true,
		unique: true,
	},
	password: {
		type: String,
		require: true,
	},
	role: {
		type: String,
		default: "admin",
	},
});

export const adminModel = mongoose.model('Admins', adminSchema);
