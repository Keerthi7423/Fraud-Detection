const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
