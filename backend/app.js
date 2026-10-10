const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

const configurePassport = require('./config/passport');

const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];

/**
 * Builds the Express app. It does not connect to MongoDB or listen on a port,
 * so tests can create it freely (see server.js for that).
 *
 * Options:
 * - authRateLimit: max login/signup attempts per IP per 15 minutes (default 20)
 */
function createApp({ authRateLimit = Number(process.env.AUTH_RATE_LIMIT) || 20 } = {}) {
  const app = express();

  // Security headers. Images are allowed cross-origin so a separately hosted frontend can show them.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // Only allow browsers on our own frontend to call the API.
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : DEFAULT_ORIGINS;
  app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST'] }));

  // Requests are small JSON bodies; reject anything large.
  app.use(express.json({ limit: '10kb' }));

  configurePassport(passport);
  app.use(passport.initialize());

  // Slow down password guessing and mass signups.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authRateLimit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' },
  });
  app.use(['/api/auth/login', '/api/auth/signup', '/api/auth/forgot-password'], authLimiter);

  app.use('/images', express.static('images'));

  app.use('/api/social', require('./routes/social'));
  app.use('/api/leaderboard', require('./routes/leaderboard'));
  app.use('/api/ChangePassword', require('./routes/ChangePassword'));
  app.use('/api/ChangeEmail', require('./routes/ChangeEmail'));
  app.use('/api/MyAccount', require('./routes/MyAccount'));
  app.use('/api/Home', require('./routes/home').router);
  app.use('/api/forest', require('./routes/forest'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/calendar', require('./routes/calendar'));
  app.use('/api/trees', require('./routes/treeRoutes'));

  // Unknown API routes get a JSON 404 instead of Express's HTML page.
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });

  // Last-resort error handler: log the details, never send them to the client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ success: false, message: 'Request is too large' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
