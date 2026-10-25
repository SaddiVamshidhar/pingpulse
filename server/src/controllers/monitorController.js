import mongoose from 'mongoose';
import Monitor from '../models/Monitor.js';
import Check from '../models/Check.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import CustomError from '../utils/customError.js';
import { calculateUptime, averageResponseTime, overallStatus } from '../utils/stats.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Attach 24h uptime and average latency to a monitor.
const withStats = async (monitor) => {
  const checks = await Check.find({
    monitor: monitor._id,
    checkedAt: { $gte: new Date(Date.now() - DAY_MS) },
  }).select('status responseTime');
  return {
    ...monitor.toObject(),
    uptime24h: calculateUptime(checks),
    avgResponseTime: averageResponseTime(checks),
    totalChecks24h: checks.length,
  };
};

export const health = (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(dbState === 'connected' ? 200 : 503).json({
    success: dbState === 'connected',
    service: 'pingpulse-api',
    database: dbState,
    uptimeSec: Math.round(process.uptime()),
  });
};

export const getAllMonitors = asyncHandler(async (req, res) => {
  const monitors = await Monitor.find().sort({ createdAt: -1 });
  const data = await Promise.all(monitors.map(withStats));
  res.status(200).json({ success: true, count: data.length, data });
});

export const getMonitor = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findById(req.params.id);
  if (!monitor) return next(new CustomError(`Monitor ${req.params.id} not found`, 404));
  res.status(200).json({ success: true, data: await withStats(monitor) });
});

export const createMonitor = asyncHandler(async (req, res) => {
  const { name, url, intervalSec } = req.body;
  const monitor = await Monitor.create({ name, url, intervalSec });
  res.status(201).json({ success: true, data: monitor });
});

export const updateMonitor = asyncHandler(async (req, res, next) => {
  const { name, url, intervalSec } = req.body;
  const monitor = await Monitor.findByIdAndUpdate(
    req.params.id,
    { name, url, intervalSec, status: 'PENDING', lastCheckedAt: null },
    { new: true, runValidators: true }
  );
  if (!monitor) return next(new CustomError(`Monitor ${req.params.id} not found`, 404));
  res.status(200).json({ success: true, data: monitor });
});

export const toggleMonitor = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findById(req.params.id);
  if (!monitor) return next(new CustomError(`Monitor ${req.params.id} not found`, 404));
  monitor.isActive = !monitor.isActive;
  monitor.status = monitor.isActive ? 'PENDING' : 'PAUSED';
  monitor.lastCheckedAt = null;
  await monitor.save();
  res.status(200).json({ success: true, data: monitor });
});

export const deleteMonitor = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findByIdAndDelete(req.params.id);
  if (!monitor) return next(new CustomError(`Monitor ${req.params.id} not found`, 404));
  await Check.deleteMany({ monitor: monitor._id });
  res.status(200).json({ success: true, message: `Monitor ${monitor.name} deleted` });
});

export const getChecks = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 500);
  const checks = await Check.find({ monitor: req.params.id }).sort({ checkedAt: -1 }).limit(limit);
  res.status(200).json({ success: true, count: checks.length, data: checks });
});

// Public status-page summary.
export const getStatusSummary = asyncHandler(async (req, res) => {
  const monitors = await Monitor.find().sort({ name: 1 });
  const data = await Promise.all(monitors.map(withStats));
  res.status(200).json({
    success: true,
    overall: overallStatus(monitors),
    generatedAt: new Date(),
    monitors: data.map(({ _id, name, status, uptime24h, avgResponseTime, isActive }) => ({
      _id, name, status, uptime24h, avgResponseTime, isActive,
    })),
  });
});
