const express = require('express');
const {
  register,
  login,
  getMe,
  getUsers,
  toggleUserStatus,
} = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
