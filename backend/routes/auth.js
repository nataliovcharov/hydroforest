const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const User = require('../database/User');

const router = express.Router();

const TOKEN_LIFETIME = '1h';

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFETIME, algorithm: 'HS256' });
}

// Return the first validation error in the shape the frontend expects.
function rejectInvalid(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

// isString() matters: without it, a JSON object like {"$ne": null} could reach MongoDB as a query operator.
const usernameRule = body('username')
  .isString().withMessage('Username is required')
  .trim()
  .isLength({ min: 3, max: 32 }).withMessage('Username must be 3 to 32 characters')
  .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only use letters, numbers, dots, dashes and underscores');

// SIGNUP
router.post(
  '/signup',
  [
    usernameRule,
    body('email').isString().trim().toLowerCase().isEmail().withMessage('Please include a valid email'),
    body('password')
      .isString().withMessage('Password is required')
      .isLength({ min: 6, max: 128 }).withMessage('Password must be 6 to 128 characters'),
  ],
  rejectInvalid,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'That username or email is already taken' });
      }

      const user = await User.create({
        username,
        email,
        password: await bcrypt.hash(password, 10),
        hydrationData: [],
        hasUnlockedTree: false,
        unlockableTrees: ['Misty Bonsai', 'Sunflower', 'Golden Sun'],
        plantLevel: 0,
        longestStreak: 0,
        currentStreak: 0,
        totalWaterLogged: 0,
        notificationsEnabled: false,
      });

      return res.status(200).json({ success: true, token: signToken(user), message: 'Signup successful!' });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// LOGIN
router.post(
  '/login',
  [
    body('username').isString().withMessage('Username is required').trim().notEmpty().withMessage('Username is required'),
    body('password').isString().withMessage('Password is required').notEmpty().withMessage('Password is required'),
  ],
  rejectInvalid,
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username }).select('+password');

      // Same answer whether the username or the password is wrong, so accounts can't be discovered.
      const isMatch = user ? await bcrypt.compare(password, user.password) : false;
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      return res.status(200).json({ success: true, token: signToken(user), message: 'Login successful!' });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// FORGOT PASSWORD (stub: always answers the same way so it doesn't reveal which emails exist)
router.post('/forgot-password', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'If this email is registered, you will receive a password reset link.',
  });
});

// GET /me: the logged-in user's profile (the password hash is never selected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Fetch user error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
