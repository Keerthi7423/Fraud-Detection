const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./src/models/Transaction');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Transaction.aggregate([
      { $match: { timestamp: { $gte: today } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          flagged: { 
            $sum: { $cond: [{ $in: ['$status', ['suspicious', 'fraudulent']] }, 1, 0] } 
          },
          confirmed: { 
            $sum: { $cond: [{ $eq: ['$status', 'fraudulent'] }, 1, 0] } 
          },
          saved: {
            $sum: { $cond: [{ $eq: ['$status', 'fraudulent'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendsPromise = Transaction.aggregate([
      { 
        $match: { 
          timestamp: { $gte: sevenDaysAgo },
          status: { $in: ['suspicious', 'fraudulent'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const categoriesPromise = Transaction.aggregate([
      { $match: { status: { $in: ['suspicious', 'fraudulent'] } } },
      {
        $group: {
          _id: "$merchantCategory",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const hoursPromise = Transaction.aggregate([
      { $match: { status: { $in: ['suspicious', 'fraudulent'] } } },
      {
        $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          hour: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const [statsResult, trendsResult, categoriesResult, hoursResult] = await Promise.all([
      stats,
      trendsPromise,
      categoriesPromise,
      hoursPromise
    ]);
    console.log(statsResult, trendsResult, categoriesResult, hoursResult);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

test();
