const mongoose = require('mongoose');

const ProductQuantitySchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		required: true
	},
	size: {
		type: String,
		enum: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
		required: true
	},
	qty: {
		type: Number,
		required: true,
		min: 0
	},
	colour: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	images: [{
		type: String // S3 URLs
	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('ProductQuantity', ProductQuantitySchema);
