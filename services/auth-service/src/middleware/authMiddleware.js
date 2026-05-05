const jwt = require('jsonwebtoken');

// Protect routes
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }
};

