# HydroForest

HydroForest is a water-tracking web app that turns staying hydrated into a game. Each glass of water you log helps your tree grow from a seed into an adult tree, and finished trees build up your forest. You can add friends, compare progress on a leaderboard and see your history on a calendar.

Built as a team project for the Agile Software Development course at New York University (Spring 2025).

## Team

- [Jun Li](https://github.com/jljune9li)
- [Natalie Ovcarov](https://github.com/nataliovcharov)
- [Daniel Brito](https://github.com/danny031103)
- [Nabiha Siddique](https://github.com/ns5190)
- [Alvaro Martinez](https://github.com/AlvaroMartinezM)

## Built with

- **Frontend:** React, React Router, Framer Motion, Vite, CSS Modules, ESLint
- **Backend:** Node.js, Express, MongoDB with Mongoose, Passport with JWT, express-validator
- **Testing:** Mocha, Chai, c8 for coverage and mongodb-memory-server
- **Security:** Helmet, express-rate-limit, express-validator
- **Deployment:** Docker

## Running it locally

You need Node.js 22 and MongoDB. The quickest way to get MongoDB is Docker:

```bash
docker run -d --name hydroforest-mongo -p 27017:27017 mongo:8
```

**Backend**

```bash
cd backend
cp .env.example .env   # then set JWT_SECRET, for example with: openssl rand -hex 32
npm install
npm run seed           # demo trees and users (alice, bob, charlie, mark; password test123). Clears existing data.
npm run dev            # http://localhost:5005, restarts when files change
```

**Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000, /api requests go to the backend
```

**Tests**

```bash
cd backend
npm test               # starts its own in-memory MongoDB, no setup needed
```

GitHub Actions runs the backend tests and the frontend lint and build on every push and pull request.

## Improvements after the course

Work I (Natalie Ovcarov) did after the course ended, on top of the team's original app.

**Frontend redesign**
- Rebuilt the interface in an iOS-inspired style that keeps the original look: a green, frosted-glass design system with shared design tokens, light and dark mode, and a bottom tab bar.
- Today screen: a progress ring around the growing tree, quick-add buttons, a custom amount sheet and a unit choice (cups, oz, ml) that is remembered.
- History: a custom calendar that shows each day's progress as a small ring, plus monthly stats.
- Replaced 14 copy-pasted pages with shared components (layout, tab bar, sheets, form fields) and one API client that handles login tokens and errors in one place.
- Fixed bugs: protected pages now redirect to login and back, a wrong current password no longer logs you out, errors show inline instead of browser alerts, friend search escapes input and hides existing friends, and the app no longer loads images from external sites.
- Accessibility: real links and buttons, keyboard-friendly sheets, labelled form fields and support for "Reduce motion".

**Backend security**
- Removed an endpoint that let anyone download every user's email and password hash without logging in.
- Friend search, the friends list and the leaderboard now return only username and total water, never emails or password hashes. Password hashes are excluded from every query by default.
- Validated every input: blocks MongoDB operator injection in login, invalid ids, oversized values and request bodies over 10 kB.
- Added rate limiting on login and signup, security headers (Helmet), a CORS allowlist and pinned JWT algorithms.
- Stopped logging user records and sending internal error details to the client.
- The seed script hashes demo passwords and refuses to run in production.
- Tests run on an in-memory database, with 20 new security tests (46 total), and CI runs on every push.

## About this repo

The original course repository is no longer available to me. I restored this copy from the backend source and the production build's source maps, and moved the frontend from Create React App to Vite. The app code is the team's original work.
