const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const Order = require('../models/Order');

// Get all packages (latest first)
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).populate('orders');
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new package with selected order IDs
router.post('/', async (req, res) => {
  try {
    const { orderIds } = req.body;
    const pkg = new Package({ orders: orderIds });
    await pkg.save();
    // Link package to orders
    await Order.updateMany({ _id: { $in: orderIds } }, { package: pkg._id });
    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update package status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const pkg = await Package.findByIdAndUpdate(req.params.id, { stages: status }, { new: true });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
