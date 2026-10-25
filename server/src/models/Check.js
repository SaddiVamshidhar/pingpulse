import { Schema, model } from 'mongoose';

// One document per ping made by the worker service.
const CheckSchema = new Schema({
  monitor: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true, index: true },
  status: { type: String, enum: ['UP', 'DOWN'], required: true },
  statusCode: { type: Number, default: null },
  responseTime: { type: Number, default: null },
  error: { type: String, default: null },
  // Checks older than 7 days are removed automatically by MongoDB (TTL index).
  checkedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

CheckSchema.index({ monitor: 1, checkedAt: -1 });

const Check = model('Check', CheckSchema);
export default Check;
