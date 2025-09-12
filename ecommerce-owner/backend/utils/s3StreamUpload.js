const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

async function uploadToS3({ fileStream, fileName, folder }) {
	const key = `${folder}/${Date.now()}-${fileName}`;
	const params = {
		Bucket: process.env.S3_BUCKET,
		Key: key,
		Body: fileStream,
		ACL: 'public-read',
	};
	await s3.send(new PutObjectCommand(params));
	// S3 v3 does not return Location, so construct it manually
	const location = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
	return { Location: location };
}

module.exports = { uploadToS3 };
