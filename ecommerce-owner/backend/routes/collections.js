const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get all collections
router.get('/', async (req, res) => {
	try {
		let collections = await Collection.find().sort({ name: 1 });
		// If no collections exist, create a default one
		if (collections.length === 0) {
			const defaultCollection = new Collection({ name: 'Default Collection', image: '' });
			await defaultCollection.save();
			collections = [defaultCollection];
		}
		res.json(collections);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create collection
router.post('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		console.log('Collection POST req.body:', req.body);
		if (!req.is('application/json')) {
			return res.status(400).json({ message: 'Request body must be JSON.' });
		}
		const { name, image } = req.body;
		if (!name || !image) {
			return res.status(400).json({ message: 'Missing required fields: name and image.' });
		}
		const collection = new Collection({ name, image });
		await collection.save();
		res.status(201).json(collection);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update collection
router.put('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const collection = await Collection.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		);
		res.json(collection);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete collection
router.delete('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		await Collection.findByIdAndDelete(req.params.id);
		res.json({ message: 'Collection deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
