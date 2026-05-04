const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined';
    console.log(`Attempting to connect to: ${maskedUri}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Do not exit process in dev, let nodemon retry
    // process.exit(1);
  }
};

module.exports = connectDB;
