import { Schema, model } from 'mongoose';

// The worker owns its own copy of the schemas it needs. strict:false lets it
// read fields added by the API without having to be redeployed.
const Monitor = model(
  'Monitor',
  new Schema(
    {
      name: String,
      url: String,
      intervalSec: Number,
      isActive: Boolean,
      status: String,
      lastStatusCode: Number,
      lastResponseTime: Number,
      lastCheckedAt: Date,
      lastChangedAt: Date,
    },
    { strict: false, timestamps: true }
  )
);

const Check = model(
  'Check',
  new Schema({
    monitor: { type: Schema.Types.ObjectId, ref: 'Monitor' },
    status: String,
    statusCode: Number,
    responseTime: Number,
    error: String,
    checkedAt: { type: Date, default: Date.now },
  })
);

export { Monitor, Check };
