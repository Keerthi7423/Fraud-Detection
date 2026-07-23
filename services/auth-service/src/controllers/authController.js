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

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Check if user is temporarily locked (from reset attempts)
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.otpLockUntil - Date.now()) / 1000 / 60);
      return res.status(403).json({
        success: false,
        error: `Account temporarily locked due to too many failed reset attempts. Try again in ${remainingTime} minute(s).`,
      });
    }

    // Check if user is temporarily locked (from login attempts)
    if (user.loginLockUntil && user.loginLockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.loginLockUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        error: `Account locked due to too many failed login attempts. Try again in ${remainingTime} minute(s).`,
        lockUntil: user.loginLockUntil.getTime(),
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 4) {
        user.loginLockUntil = Date.now() + 3 * 60 * 1000; // Lock for 3 minutes
        await user.save({ validateBeforeSave: false });
        return res.status(429).json({
          success: false,
          error: 'Too many failed login attempts. Try again in 3 minute(s).',
          lockUntil: user.loginLockUntil.getTime(),
        });
      }

      await user.save({ validateBeforeSave: false });
      const remaining = 4 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        error: `Invalid credentials. ${remaining} attempt(s) remaining.`,
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    user.loginAttempts = 0;
    user.loginLockUntil = undefined;
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

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: true, // MUST be true for cross-domain cookies
    sameSite: 'none', // MUST be 'none' for cross-domain cookies (Vercel -> AWS)
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token, // We can still return it for legacy apps or debugging, but the client shouldn't store it
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Logout user / clear cookie
// @route   POST /auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Get all users
// @route   GET /auth/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /auth/users/:id/toggle
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

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

// @desc    Forgot Password
// @route   POST /auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'There is no user with that email',
      });
    }

    // Hardcode OTP to '123456' as requested
    user.resetPasswordOtp = '123456';
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      data: '123456' // Just sending it back in data for development/testing convenience
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// @desc    Reset Password
// @route   POST /auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // 1. Check if user is locked out
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.otpLockUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Try again in ${remainingTime} minute(s).`,
        lockUntil: user.otpLockUntil.getTime(),
      });
    }

    // 2. Validate OTP and expiration
    const isValidOtp = user.resetPasswordOtp === otp;
    const isExpired = !user.resetPasswordExpire || user.resetPasswordExpire < Date.now();

    if (!isValidOtp || isExpired) {
      user.otpAttempts += 1;
      
      if (user.otpAttempts >= 4) {
        user.otpLockUntil = Date.now() + 3 * 60 * 1000; // Lock for 3 minutes
        await user.save({ validateBeforeSave: false });
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts. Try again in 3 minute(s).',
          lockUntil: user.otpLockUntil.getTime(),
        });
      }
      
      await user.save({ validateBeforeSave: false });
      const remaining = 4 - user.otpAttempts;
      return res.status(400).json({
        success: false,
        error: isValidOtp ? 'OTP has expired' : `Invalid OTP. ${remaining} attempt(s) remaining.`,
      });
    }

    // 3. Same Password Check
    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: 'New password cannot be the same as the old password',
      });
    }

    // 4. Success: Set new password and reset lock/attempts
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};
