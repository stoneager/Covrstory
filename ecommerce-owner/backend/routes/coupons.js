const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get all coupons
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const coupons = await Coupon.find()
			.populate('applicable', 'name email')
			.populate('used_ids', 'name email');
		res.json(coupons);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create coupon
router.post('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { 
			couponCode, 
			userEmails, 
			priceCondition, 
			red_price, 
			red_percent 
		} = req.body;
    
		let applicable = [];
		if (userEmails && userEmails.length > 0) {
			const users = await User.find({ email: { $in: userEmails } });
			applicable = users.map(user => user._id);
		}
    
		const coupon = new Coupon({
			couponCode: couponCode.toUpperCase(),
			applicable,
			price_condition: priceCondition,
			red_price,
			red_percent
		});
    
		await coupon.save();
		res.status(201).json(coupon);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update coupon
router.put('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const coupon = await Coupon.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(coupon);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete coupon
router.delete('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		await Coupon.findByIdAndDelete(req.params.id);
		res.json({ message: 'Coupon deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
