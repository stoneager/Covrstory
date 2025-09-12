const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
	couponCode: {
		type: String,
		required: true,
		unique: true,
		uppercase: true
	},
	applicable: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}], // Empty array means ALL users
	used_ids: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	price_condition: {
		low: {
			type: Number,
			default: null
		},
		up: {
			type: Number,
			default: null
		}
	},
	red_price: {
		type: Number,
		default: null
	},
	red_percent: {
		type: Number,
		default: null,
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

module.exports = mongoose.model('Coupon', CouponSchema);
