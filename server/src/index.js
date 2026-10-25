import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import Monitor from './models/Monitor.js';

config();

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pingpulse';

// Optionally create a few monitors on first start so the dashboard is not empty.
const seedDemoMonitors = async () => {
  if (process.env.SEED_DEMO !== 'true') return;
  if ((await Monitor.countDocuments()) > 0) return;
  await Monitor.insertMany([
    { name: 'Google', url: 'https://www.google.com', intervalSec: 30 },
    { name: 'GitHub', url: 'https://github.com', intervalSec: 30 },
    { name: 'Demo Site (container)', url: 'http://demo-site', intervalSec: 10 },
    { name: 'Broken Endpoint', url: 'https://httpstat.us/503', intervalSec: 60 },
  ]);
  console.log('Seeded demo monitors');
};

const start = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    await seedDemoMonitors();
    app.listen(port, () => console.log(`PingPulse API running on port ${port}`));
  } catch (err) {
    console.error('Failed to start API:', err.message);
    process.exit(1);
  }
};

start();
