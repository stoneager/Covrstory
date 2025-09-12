const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 client with proper configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getPresignedUrl({ key, contentType }) {
  try {
    // Use the correct bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('S3 bucket name not configured. Please set S3_BUCKET_NAME in environment variables.');
    }

    console.log('Creating presigned URL for bucket:', bucketName);
    console.log('S3 Key:', key);
    console.log('Content Type:', contentType);
    console.log('AWS Region:', process.env.AWS_REGION);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      // No ACL parameter - using bucket policy for public access
    });

    // Generate presigned URL with 10-minute expiration (increased from 5 minutes)
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    
    console.log('Generated presigned URL successfully');
    console.log('Presigned URL (first 100 chars):', presignedUrl.substring(0, 100) + '...');
    
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

// Function to verify S3 configuration
function verifyS3Config() {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_REGION',
    'S3_BUCKET_NAME'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required S3 environment variables:', missing);
    return false;
  }

  console.log('S3 configuration verified successfully');
  return true;
}

module.exports = { getPresignedUrl, verifyS3Config };