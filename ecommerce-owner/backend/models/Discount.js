const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
	products: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	}], // Empty array means ALL products
	discount_percent: {
		type: Number,
		required: true,
		min: 0,
		max: 100
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Discount', DiscountSchema);
