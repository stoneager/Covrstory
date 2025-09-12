const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
	orders: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order'
	}],
	stages: {
		type: String,
		enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
		default: 'pending'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Package', PackageSchema);
