const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	items: [{
		productQuantity: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ProductQuantity',
			required: true
		},
		qty: {
			type: Number,
			required: true,
			min: 1
		}
	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
