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

- **Frontend:** React, React Router, Framer Motion, Vite
- **Backend:** Node.js, Express, MongoDB with Mongoose, Passport with JWT, express-validator
- **Testing:** Mocha, Chai and c8 for coverage
- **Deployment:** Docker

## Running it locally

You need Node.js 22 and a MongoDB database (a free MongoDB Atlas cluster works).

**Backend**

```bash
cd backend
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed           # adds the tree types. Warning: clears existing users and trees
npm run dev            # http://localhost:5005
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
npm test               # runs against the database in .env, so use a test database
```

## About this repo

The original course repository is no longer available to me. I restored this copy from the backend source and the production build's source maps, and moved the frontend from Create React App to Vite. The app code is the team's original work.
