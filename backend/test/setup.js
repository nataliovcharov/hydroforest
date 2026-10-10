// Runs before every test file. Each test run gets its own throwaway MongoDB,
// so tests never touch a real database.
//
// Set TEST_MONGO_URI to use an existing database instead (it is wiped after the run).
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';
// Tests sign up and log in many times; the limiter itself has its own test.
process.env.AUTH_RATE_LIMIT = process.env.AUTH_RATE_LIMIT || '10000';

let memoryServer;

// Global setup and teardown run once, before and after all test files (including their own hooks).
// The first run downloads a MongoDB binary, which can take a minute.
exports.mochaGlobalSetup = async function () {
  let uri = process.env.TEST_MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hydroforest-test');
  }
  await mongoose.connect(uri);
};

exports.mochaGlobalTeardown = async function () {
  if (process.env.TEST_MONGO_URI) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};
