const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get orders with statistics
router.get('/stats', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { filter } = req.query; // 'day', 'week', 'month'
    
		let dateFilter = {};
		const now = new Date();
    
		switch(filter) {
			case 'day':
				dateFilter = {
					createdAt: {
						$gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
						$lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
					}
				};
				break;
			case 'week':
				const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
				dateFilter = {
					createdAt: {
						$gte: weekStart,
						$lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
					}
				};
				break;
			case 'month':
				dateFilter = {
					createdAt: {
						$gte: new Date(now.getFullYear(), now.getMonth(), 1),
						$lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
					}
				};
				break;
		}
    
		const stats = await Order.aggregate([
			{ $match: dateFilter },
			{ $group: { _id: '$stages', count: { $sum: 1 }, total: { $sum: '$total_mrp' } } }
		]);
    
		const orders = await Order.find(dateFilter)
			.populate('user', 'name email')
			.sort({ createdAt: -1 })
			.limit(50);
    
		res.json({ stats, orders });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get all orders
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const orders = await Order.find()
			.populate('user', 'name email')
			.sort({ createdAt: -1 });
		res.json(orders);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
