const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	jwt_token: {
		type: String
	},
	role: {
		type: String,
		enum: ['customer', 'owner'],
		default: 'customer'
	},
	mobile: {
		type: String
	},
	address: {
		line1: String,
		area: String,
		city: String,
		pincode: String
	},
	orderHistory: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order'
	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
