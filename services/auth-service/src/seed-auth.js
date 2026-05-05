const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing users
    await User.deleteMany();
    console.log('Existing users cleared.');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'admin'
    });
    console.log('Admin user created: admin@test.com / Password123');

    // Create Analyst
    const analyst = await User.create({
      name: 'Analyst User',
      email: 'analyst@test.com',
      password: 'Password123',
      role: 'analyst'
    });
    console.log('Analyst user created: analyst@test.com / Password123');

    process.exit();
  } catch (err) {
    console.error('Error seeding users:', err.message);
    process.exit(1);
  }
};

seedUsers();
