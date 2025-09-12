const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get all users
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const users = await User.find({ role: 'customer' }).select('name email');
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
