const { SendMessageCommand } = require('@aws-sdk/client-sqs');
const sqsClient = require('../config/sqsClient');

const sendToScoringQueue = async (transaction) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('DEV MODE: Skipping SQS, logging message:', JSON.stringify(transaction, null, 2));
    return;
  }

  const params = {
    QueueUrl: process.env.SQS_SCORING_QUEUE_URL,
    MessageBody: JSON.stringify({
      messageType: 'SCORE_TRANSACTION',
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      merchantName: transaction.merchantName,
      merchantCategory: transaction.merchantCategory,
      location: transaction.location,
      timestamp: transaction.timestamp,
      cardType: transaction.cardType,
      cardLastFour: transaction.cardLastFour
    })
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('Success, message sent to SQS:', data.MessageId);
    return data;
  } catch (err) {
    console.error('Error sending message to SQS:', err);
    // Do not crash the service if SQS fails
  }
};

module.exports = { sendToScoringQueue };
