import { Schema, model } from 'mongoose';

const MonitorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Monitor name is required'],
      maxlength: [60, 'Monitor name cannot exceed 60 characters'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      match: [/^https?:\/\/.+/i, 'URL must start with http:// or https://'],
    },
    intervalSec: {
      type: Number,
      default: 30,
      min: [10, 'Interval must be at least 10 seconds'],
      max: [3600, 'Interval cannot exceed 1 hour'],
    },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'PENDING', 'PAUSED'],
      default: 'PENDING',
    },
    lastStatusCode: { type: Number, default: null },
    lastResponseTime: { type: Number, default: null },
    lastCheckedAt: { type: Date, default: null },
    lastChangedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Monitor = model('Monitor', MonitorSchema);
export default Monitor;
