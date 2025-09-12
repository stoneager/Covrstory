const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	items: [{
		productQuantity: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ProductQuantity'
		},
		qty: Number,
		price: Number, // Snapshot price
		productName: String,
		size: String,
		colour: String
	}],
	total_mrp: {
		type: Number,
		required: true
	},
	coupon_code: {
		type: String,
		default: null
	},
	stages: {
		type: String,
		enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
		default: 'pending'
	},
	package: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Package'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
