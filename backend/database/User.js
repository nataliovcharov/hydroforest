const mongoose = require('mongoose');

const hydrationEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  unlockedPlant: { type: String }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // Never returned by queries unless asked for with .select('+password').
  password: { type: String, required: true, select: false },
  email: { type: String, required: true, unique: true },
  hydrationData: [hydrationEntrySchema],
  hasUnlockedTree: { type: Boolean, default: false },
  unlockableTrees: [String],
  plantLevel: { type: Number, default: 1 },
  longestStreak: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  totalWaterLogged: { type: Number, default: 0 },
  notificationsEnabled: { type: Boolean, default: false },
  selectedTree: { type: String },
  selectedTreeDate: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', userSchema);
