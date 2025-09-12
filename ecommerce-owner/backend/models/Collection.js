const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	image: {
		type: String // S3 URL
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Collection', CollectionSchema);
