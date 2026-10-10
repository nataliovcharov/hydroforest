const express = require('express');
const passport = require('passport');
const { body, query, validationResult } = require('express-validator');
const User = require('../database/User');

const router = express.Router();

// Only these fields of other users are ever sent to the client.
const PUBLIC_FIELDS = '_id username totalWaterLogged';
const MAX_SUGGESTIONS = 10;

const authenticate = passport.authenticate('jwt', { session: false });

function rejectInvalid(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

// Treat the search text literally, so characters like "." or "*" don't act as a regex.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const friendIdRule = body('friendId').isMongoId().withMessage('friendId must be a valid user id');

// GET all friends for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ friends: user.friends });
  } catch (err) {
    console.error('Friends error:', err);
    res.status(500).json({ error: 'Failed to fetch friends.' });
  }
});

// GET people to add, matching the search text. Excludes yourself and existing friends.
router.get(
  '/suggestions',
  authenticate,
  [
    query('q')
      .optional()
      .isString()
      .isLength({ max: 20 })
      .withMessage('Query must be a string no longer than 20 characters'),
  ],
  rejectInvalid,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('friends');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const text = (req.query.q || '').trim();
      const suggestions = await User.find({
        _id: { $nin: [user._id, ...user.friends] },
        username: { $regex: escapeRegex(text), $options: 'i' },
      })
        .select(PUBLIC_FIELDS)
        .sort({ username: 1 })
        .limit(MAX_SUGGESTIONS)
        .lean();

      if (suggestions.length === 0) {
        return res.json({ suggestions: [], message: 'No Users Found' });
      }
      res.json({ suggestions });
    } catch (err) {
      console.error('Suggestions error:', err);
      res.status(500).json({ error: 'Failed to fetch suggestions.' });
    }
  }
);

// POST to add a friend
router.post('/add', authenticate, [friendIdRule], rejectInvalid, async (req, res) => {
  const { friendId } = req.body;

  if (friendId === String(req.user._id)) {
    return res.status(400).json({ error: "You can't add yourself as a friend." });
  }

  try {
    if (!(await User.exists({ _id: friendId }))) {
      return res.status(404).json({ error: 'User not found' });
    }
    // $addToSet never adds the same friend twice.
    await User.updateOne({ _id: req.user._id }, { $addToSet: { friends: friendId } });
    res.json({ success: true, message: 'Friend added.' });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ error: 'Failed to add friend.' });
  }
});

// POST to remove a friend
router.post('/remove', authenticate, [friendIdRule], rejectInvalid, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { friends: req.body.friendId } });
    res.json({ success: true, message: 'Friend removed.' });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ error: 'Failed to remove friend.' });
  }
});

module.exports = router;
