const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { sendToScoringQueue } = require('../services/queueService');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a Razorpay Order
 */
const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 50000, // ₹500
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // FORCE AUTOMATIC CAPTURE
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Could not create order' });
  }
};

/**
 * Handle Razorpay Webhooks
 */
const handleWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    console.error('No Razorpay signature found in headers');
    return res.status(400).json({ status: 'error', message: 'No signature' });
  }

  // Verify Razorpay Webhook Signature
  // req.body is a Buffer because we use express.raw() in server.js
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid Razorpay signature verification failed');
    return res.status(400).json({ status: 'error', message: 'Invalid signature' });
  }

  // Parse the raw body into JSON
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('Failed to parse Razorpay webhook body:', err);
    return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
  }

  console.log('Razorpay Webhook Received:', event.event);

  // Handle 'payment.captured' event
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    
    try {
      // Avoid processing the same payment twice
      const existingTxn = await Transaction.findOne({ transactionId: payment.id });
      if (existingTxn) {
        console.log('Payment already processed:', payment.id);
        return res.json({ status: 'ok', message: 'Duplicate ignored' });
      }

      // Map Razorpay payment entity to our Transaction model
      const transactionData = {
        transactionId: payment.id,
        amount: payment.amount / 100, // Convert paise to INR
        currency: payment.currency,
        merchantName: payment.notes?.merchant_name || 'Razorpay Store',
        merchantCategory: payment.notes?.category || 'Online Shopping',
        cardLastFour: payment.card?.last4 || 'N/A',
        cardType: payment.method || 'unknown',
        location: {
          city: payment.notes?.city || 'Mumbai',
          country: 'IN',
          ipAddress: payment.ip || '0.0.0.0'
        },
        timestamp: new Date(payment.created_at * 1000), // Razorpay sends Unix timestamp
        status: 'pending',
        scoringStatus: 'queued'
      };

      const transaction = await Transaction.create(transactionData);
      console.log('Transaction created from Razorpay:', transaction.transactionId);

      // Trigger AI scoring via SQS
      await sendToScoringQueue(transaction);

    } catch (error) {
      console.error('Error saving Razorpay transaction:', error);
    }
  }

  // Razorpay expects a 200 OK response
  res.status(200).json({ status: 'ok' });
};

module.exports = { createOrder, handleWebhook };
