const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { scoreTransaction } = require('../services/aiScoringService');
const Transaction = require('../models/Transaction');
require('dotenv').config();

const sqs = new SQSClient({ 
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock'
  }
});

const SCORING_QUEUE = process.env.SQS_SCORING_QUEUE_URL;
const NOTIFICATION_QUEUE = process.env.SQS_NOTIFICATION_QUEUE_URL;

async function pollQueue() {
  if (process.env.NODE_ENV === 'development' && (!SCORING_QUEUE || SCORING_QUEUE.includes('placeholder'))) {
    // console.log('DEV MODE: SQS Queue URL not configured, skipping poll');
    return;
  }

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: SCORING_QUEUE,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10   // long polling — reduces cost
    });

    const response = await sqs.send(command);
    if (!response.Messages || response.Messages.length === 0) return;

    for (const message of response.Messages) {
      const body = JSON.parse(message.Body);
      console.log(`Processing transaction: ${body.transactionId}`);

      // Score the transaction with Gemini
      const score = await scoreTransaction(body);

      // Determine status from score
      let newStatus = 'clean';
      if (score.riskScore > 90) newStatus = 'fraudulent';
      else if (score.riskScore > 70) newStatus = 'suspicious';

      // Update transaction in MongoDB
      await Transaction.findOneAndUpdate(
        { transactionId: body.transactionId },
        {
          riskScore: score.riskScore,
          riskLevel: score.riskLevel,
          aiReasons: score.aiReasons,
          aiRecommendation: score.aiRecommendation,
          status: newStatus,
          scoringStatus: 'scored'
        }
      );

      // Send to notification queue
      try {
        await sqs.send(new SendMessageCommand({
          QueueUrl: NOTIFICATION_QUEUE,
          MessageBody: JSON.stringify({
            messageType: 'TRANSACTION_SCORED',
            transactionId: body.transactionId,
            riskScore: score.riskScore,
            riskLevel: score.riskLevel,
            newStatus,
            aiReasons: score.aiReasons,
            action: 'auto-flagged',
            source: 'system'
          })
        }));
      } catch (sqsErr) {
        console.error('Error sending to notification queue:', sqsErr.message);
      }

      // Delete message from queue after processing
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: SCORING_QUEUE,
        ReceiptHandle: message.ReceiptHandle
      }));

      console.log(`Scored ${body.transactionId}: ${score.riskScore} (${newStatus})`);
    }
  } catch (err) {
    if (err.name === 'EndpointConnectionError' || err.name === 'CredentialsError') {
       // Silent fail in dev as per PRD
    } else {
       console.error('Worker error:', err.message);
    }
  }
}

// Poll every 5 seconds
setInterval(pollQueue, 5000);
console.log('AI Scoring Worker started — polling SQS every 5s');
