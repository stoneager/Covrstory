const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const Product = require('../models/Product');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get all discounts
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const discounts = await Discount.find().populate('products', 'name');
		res.json(discounts);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create discount
router.post('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { productIds, discount_percent } = req.body;
    
		const discount = new Discount({
			products: productIds || [], // Empty array means all products
			discount_percent
		});
    
		await discount.save();
		res.status(201).json(discount);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update discount
router.put('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const discount = await Discount.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(discount);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete discount
router.delete('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		await Discount.findByIdAndDelete(req.params.id);
		res.json({ message: 'Discount deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
