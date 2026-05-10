const { ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const sqsClient = require('../config/sqsClient');
const AuditLog = require('../models/AuditLog');

const pollNotifications = async () => {
    if (process.env.NODE_ENV === 'development' && process.env.AWS_ACCESS_KEY_ID === 'placeholder') {
        console.log('Notification Worker: Skipping real SQS polling in development mode with placeholders.');
        return;
    }

    const params = {
        QueueUrl: process.env.SQS_NOTIFICATION_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20
    };

    try {
        const data = await sqsClient.send(new ReceiveMessageCommand(params));

        if (data.Messages) {
            for (const message of data.Messages) {
                try {
                    const body = JSON.parse(message.Body);
                    
                    // Create audit log
                    const auditLog = new AuditLog({
                        transactionId: body.transactionId,
                        analystId: body.analystId,
                        analystName: body.analystName || 'system',
                        action: body.action,
                        note: body.note || (body.aiReasons ? body.aiReasons.join(', ') : ''),
                        previousStatus: body.previousStatus,
                        newStatus: body.newStatus,
                        riskScore: body.riskScore,
                        source: body.analystId ? 'analyst' : 'system'
                    });

                    await auditLog.save();
                    console.log(`Audit logged: ${body.transactionId} -> ${body.action}`);

                    // Delete message from queue
                    await sqsClient.send(new DeleteMessageCommand({
                        QueueUrl: process.env.SQS_NOTIFICATION_QUEUE_URL,
                        ReceiptHandle: message.ReceiptHandle
                    }));
                } catch (parseError) {
                    console.error('Error processing message:', parseError.message);
                }
            }
        }
    } catch (error) {
        console.error('Notification Worker Error:', error.message);
    }
};

// Start polling
console.log('Notification Worker started — polling SQS every 5s');
setInterval(pollNotifications, 5000);
