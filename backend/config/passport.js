const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../database/User');

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    // Only accept the algorithm we sign with.
    algorithms: ['HS256'],
  };

  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        return done(null, user || false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
