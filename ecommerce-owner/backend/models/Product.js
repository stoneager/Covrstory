const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
	collection: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Collection',
		required: true
	},
	type: {
		type: String,
		enum: ['bottom', 'top'],
		required: true
	},
	gender: {
		type: String,
		enum: ['m', 'f'],
		required: true
	},
	activity: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
