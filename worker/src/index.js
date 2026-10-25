import { config } from 'dotenv';
import mongoose from 'mongoose';
import { Monitor, Check } from './models.js';
import { ping, isDue } from './pinger.js';

config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pingpulse';
const tickMs = Number(process.env.TICK_MS) || 5000;
const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 10000;

const inFlight = new Set();

const checkMonitor = async (monitor) => {
  inFlight.add(String(monitor._id));
  try {
    const result = await ping(monitor.url, timeoutMs);
    const now = new Date();

    await Check.create({ monitor: monitor._id, ...result, checkedAt: now });

    const update = {
      status: result.status,
      lastStatusCode: result.statusCode,
      lastResponseTime: result.responseTime,
      lastCheckedAt: now,
    };
    if (monitor.status !== result.status) {
      update.lastChangedAt = now;
      // Simple alerting: status changes are logged so they show up in `docker compose logs`.
      if (monitor.status !== 'PENDING' || result.status === 'DOWN') {
        const icon = result.status === 'UP' ? 'RECOVERED' : 'ALERT';
        console.log(`[${icon}] ${monitor.name} (${monitor.url}) is now ${result.status}` +
          (result.error ? ` - ${result.error}` : ''));
      }
    }
    // Only update if the monitor was not paused/deleted while the ping was running.
    await Monitor.updateOne({ _id: monitor._id, isActive: true }, update);

    console.log(`${result.status.padEnd(4)} ${String(result.statusCode ?? '---')} ` +
      `${String(result.responseTime ?? '-').padStart(5)} ms  ${monitor.name}`);
  } catch (err) {
    console.error(`Error checking ${monitor.name}:`, err.message);
  } finally {
    inFlight.delete(String(monitor._id));
  }
};

const tick = async () => {
  try {
    const monitors = await Monitor.find({ isActive: true });
    monitors
      .filter((m) => !inFlight.has(String(m._id)) && isDue(m))
      .forEach((m) => checkMonitor(m)); // run checks concurrently
  } catch (err) {
    console.error('Tick failed:', err.message);
  }
};

const start = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log(`PingPulse worker connected to MongoDB, ticking every ${tickMs} ms`);
    tick();
    setInterval(tick, tickMs);
  } catch (err) {
    console.error('Worker failed to start:', err.message);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('Worker shutting down');
  await mongoose.disconnect();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
