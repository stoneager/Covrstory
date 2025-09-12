const express = require('express');
const router = express.Router();
const busboyModule = require('busboy');
const { uploadToS3 } = require('../utils/s3StreamUpload');
const { getPresignedUrl } = require('../utils/s3PresignedUrl');
const { dummyAuth, ownerOnly } = require('../middleware/auth');

// Get presigned URL for product image upload
router.post('/product-presigned', dummyAuth, ownerOnly, async (req, res) => {
	try {
		const { productName, color, filename, contentType } = req.body;
		if (!productName || !color || !filename || !contentType) {
			return res.status(400).json({ message: 'Missing required fields.' });
		}
		
		// Sanitize the filename for S3 key
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
		const key = `products/${productName}/${color}/${sanitizedFilename}`;
		const url = await getPresignedUrl({ key, contentType });
		res.json({ url, key });
	} catch (error) {
		console.error('Error in /product-presigned:', error);
		res.status(500).json({ message: error.message });
	}
});

// Get presigned URL for collection image upload
router.post('/collection-presigned', dummyAuth, ownerOnly, async (req, res) => {
	try {
		console.log('collection-presigned req.body:', req.body);
		console.log('S3_BUCKET from env:', process.env.S3_BUCKET_NAME);
		console.log('AWS_REGION from env:', process.env.AWS_REGION);
		
		const { collectionName, filename, contentType } = req.body;
		
		if (!collectionName || !filename || !contentType) {
			return res.status(400).json({ message: 'Missing required fields.' });
		}
		
		// Sanitize the collection name and filename for S3 key
		const sanitizedCollectionName = collectionName.replace(/[^a-zA-Z0-9-]/g, '_');
		const sanitizedFilename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
		const key = `collections/${sanitizedCollectionName}/${sanitizedFilename}`;
		
		console.log('Sanitized S3 key:', key);
		
		const url = await getPresignedUrl({ key, contentType });
		
		console.log('Generated presigned URL:', url);
		
		res.json({ url, key });
	} catch (error) {
		console.error('Error in /collection-presigned:', error);
		res.status(500).json({ message: error.message });
	}
});

// Upload product images (legacy multipart upload)
router.post('/product', dummyAuth, ownerOnly, (req, res) => {
	const busboy = busboyModule({ headers: req.headers });
	const urls = [];
	let productName = '';
	let color = '';
	const uploadPromises = [];

	busboy.on('field', (fieldname, val) => {
		if (fieldname === 'productName') productName = val;
		if (fieldname === 'color') color = val;
	});

	busboy.on('file', (fieldname, file, filename) => {
		const folder = `products/${productName}/${color}`;
		const uploadPromise = uploadToS3({ fileStream: file, fileName: filename, folder })
			.then(result => {
				urls.push(result.Location);
			})
			.catch(err => {
				console.error('Error uploading file:', err);
				urls.push({ error: err.message });
			});
		uploadPromises.push(uploadPromise);
	});

	busboy.on('finish', async () => {
		await Promise.all(uploadPromises);
		res.json({ urls });
	});

	busboy.on('error', (err) => {
		console.error('Busboy error:', err);
		res.status(500).json({ message: 'Upload processing error' });
	});

	req.pipe(busboy);
});

// Upload collection image (legacy multipart upload)
router.post('/collection', dummyAuth, ownerOnly, (req, res) => {
	const busboy = busboyModule({ headers: req.headers });
	let collectionName = '';
	let url = '';
	let fileUploaded = false;
	const uploadPromises = [];

	busboy.on('field', (fieldname, val) => {
		if (fieldname === 'collectionName') collectionName = val;
	});

	busboy.on('file', (fieldname, file, filename) => {
		fileUploaded = true;
		const folder = `collections/${collectionName}`;
		const uploadPromise = uploadToS3({ fileStream: file, fileName: filename, folder })
			.then(result => {
				url = result.Location;
			})
			.catch(err => {
				console.error('Error uploading collection file:', err);
				url = { error: err.message };
			});
		uploadPromises.push(uploadPromise);
	});

	busboy.on('finish', async () => {
		await Promise.all(uploadPromises);
		if (!fileUploaded) {
			return res.status(400).json({ message: 'No file uploaded.' });
		}
		res.json({ url });
	});

	busboy.on('error', (err) => {
		console.error('Busboy error:', err);
		res.status(500).json({ message: 'Upload processing error' });
	});

	req.pipe(busboy);
});

module.exports = router;