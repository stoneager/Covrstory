const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const ProductQuantity = require('../models/ProductQuantity');
const Collection = require('../models/Collection');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get all products with search
router.get('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { search } = req.query;
		let query = {};
		if (search) {
			query.name = { $regex: search, $options: 'i' };
		}
		const products = await Product.find(query)
			.populate('collection')
			.sort({ createdAt: -1 });

		// For each product, fetch its quantities and group by color
		const productsWithVariants = await Promise.all(products.map(async (product) => {
			const quantities = await ProductQuantity.find({ product: product._id });
			const variantsMap = {};
			quantities.forEach(qty => {
				if (!variantsMap[qty.colour]) {
					variantsMap[qty.colour] = {
						colour: qty.colour,
						price: qty.price,
						images: qty.images || [],
						sizes: []
					};
				}
				variantsMap[qty.colour].sizes.push({
					size: qty.size,
					qty: qty.qty
				});
			});
			const variants = Object.values(variantsMap);
			return {
				...product.toObject(),
				variants
			};
		}));

		res.json(productsWithVariants);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get product with quantities
router.get('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate('collection');
		const quantities = await ProductQuantity.find({ product: req.params.id });
    
		res.json({ product, quantities });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create new product
router.post('/', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { collection, type, gender, activity, name, description, variants } = req.body;
    
		const product = new Product({
			collection,
			type,
			gender,
			activity,
			name,
			description
		});
    
		await product.save();
    
		// Create product quantities for each variant
		const quantities = [];
		for (const variant of variants) {
			for (const size of variant.sizes) {
				const productQuantity = new ProductQuantity({
					product: product._id,
					size: size.size,
					qty: size.qty,
					colour: variant.colour,
					price: variant.price,
					images: variant.images || []
				});
				quantities.push(await productQuantity.save());
			}
		}
    
		res.status(201).json({ product, quantities });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update product quantities
router.put('/:id/quantities', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { quantities } = req.body;
    
		for (const qty of quantities) {
			await ProductQuantity.findByIdAndUpdate(qty._id, {
				qty: qty.qty,
				price: qty.price,
				images: qty.images
			});
		}
    
		res.json({ message: 'Quantities updated successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete product
router.delete('/:id', dummyAuth, ownerOnly, async (req, res) => {
	try {
		await ProductQuantity.deleteMany({ product: req.params.id });
		await Product.findByIdAndDelete(req.params.id);
		res.json({ message: 'Product deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
