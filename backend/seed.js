// Fills the database with demo trees and users. Deletes all existing users and trees first.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./database/User');
const Tree = require('./database/Tree');

// Demo accounts all use this password. They are for local development only.
const DEMO_PASSWORD = 'test123';

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed: this deletes every user, and NODE_ENV is production.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear old data
  await User.deleteMany();
  await Tree.deleteMany();

  // Insert trees
  await Tree.insertMany([
    {
      name: 'Misty Bonsai',
      stages: {
        seed: '/images/tree1/seed.png',
        sprout: '/images/tree1/sprout.png',
        seedling: '/images/tree1/seedling.png',
        sapling: '/images/tree1/sapling.png',
        adultTree: '/images/tree1/adult_tree.png'
      }
    },
    {
      name: 'Sunflower',
      stages: {
        seed: '/images/tree2/seed.png',
        sprout: '/images/tree2/sprout.png',
        seedling: '/images/tree2/seedling.png',
        sapling: '/images/tree2/sapling.png',
        adultTree: '/images/tree2/adult_tree.png'
      }
    },
    {
      name: 'Golden Sun',
      stages: {
        seed: '/images/tree3/seed.png',
        sprout: '/images/tree3/sprout.png',
        seedling: '/images/tree3/seedling.png',
        sapling: '/images/tree3/sapling.png',
        adultTree: '/images/tree3/adult_tree.png'
      }
    }
  ]);
  console.log('🌱 Trees seeded');

  // Only the first three trees have images for every growth stage.
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Insert users and store their references
  const [alice, bob, charlie, mark] = await User.insertMany([
    {
      username: 'alice',
      password,
      email: 'alice@example.com',
      hydrationData: [],
      hasUnlockedTree: true,
      unlockableTrees: ['Misty Bonsai', 'Sunflower', 'Golden Sun'],
      plantLevel: 3,
      longestStreak: 7,
      currentStreak: 2,
      totalWaterLogged: 3500,
      notificationsEnabled: true,
      friends: []
    },
    {
      username: 'bob',
      password,
      email: 'bob@example.com',
      hydrationData: [
        { date: new Date(), amount: 500, unlockedPlant: 'Sunflower' }
      ],
      hasUnlockedTree: false,
      unlockableTrees: ['Misty Bonsai', 'Sunflower', 'Golden Sun'],
      plantLevel: 2,
      longestStreak: 5,
      currentStreak: 5,
      totalWaterLogged: 3000,
      notificationsEnabled: false,
      friends: []
    },
    {
      username: 'charlie',
      password,
      email: 'charlie@example.com',
      hydrationData: [],
      hasUnlockedTree: false,
      unlockableTrees: ['Misty Bonsai', 'Sunflower', 'Golden Sun'],
      plantLevel: 1,
      longestStreak: 2,
      currentStreak: 1,
      totalWaterLogged: 1200,
      notificationsEnabled: true,
      friends: []
    },
    {
      username: 'mark',
      password,
      email: 'mark@example.com',
      hydrationData: [],
      hasUnlockedTree: false,
      unlockableTrees: ['Misty Bonsai', 'Sunflower', 'Golden Sun'],
      plantLevel: 1,
      longestStreak: 3,
      currentStreak: 1,
      totalWaterLogged: 1400,
      notificationsEnabled: true,
      friends: []
    }
  ]);
  console.log('👤 Users seeded');

  // Add friendships (by ID)
  alice.friends = [bob._id, charlie._id];
  bob.friends = [alice._id, mark._id];
  charlie.friends = [alice._id];
  mark.friends = [bob._id];

  await alice.save();
  await bob.save();
  await charlie.save();
  await mark.save();

  console.log('👥 Friendships established');
  await mongoose.connection.close();
  console.log(`✅ Database seed complete! Log in as alice, bob, charlie or mark with password "${DEMO_PASSWORD}".`);
}

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
