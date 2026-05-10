const { SQSClient } = require('@aws-sdk/client-sqs');
require('dotenv').config();

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock'
  }
});

module.exports = sqsClient;
