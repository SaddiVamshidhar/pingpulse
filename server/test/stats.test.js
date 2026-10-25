import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateUptime, averageResponseTime, overallStatus } from '../src/utils/stats.js';

test('calculateUptime returns null when there are no checks', () => {
  assert.equal(calculateUptime([]), null);
});

test('calculateUptime returns percentage of UP checks', () => {
  const checks = [{ status: 'UP' }, { status: 'UP' }, { status: 'UP' }, { status: 'DOWN' }];
  assert.equal(calculateUptime(checks), 75);
});

test('averageResponseTime ignores DOWN checks', () => {
  const checks = [
    { status: 'UP', responseTime: 100 },
    { status: 'UP', responseTime: 300 },
    { status: 'DOWN', responseTime: 9000 },
  ];
  assert.equal(averageResponseTime(checks), 200);
});

test('overallStatus reports outages correctly', () => {
  assert.equal(overallStatus([]), 'NO_MONITORS');
  assert.equal(overallStatus([{ isActive: true, status: 'UP' }]), 'OPERATIONAL');
  assert.equal(
    overallStatus([{ isActive: true, status: 'UP' }, { isActive: true, status: 'DOWN' }]),
    'PARTIAL_OUTAGE'
  );
  assert.equal(overallStatus([{ isActive: true, status: 'DOWN' }]), 'MAJOR_OUTAGE');
  assert.equal(overallStatus([{ isActive: false, status: 'DOWN' }]), 'NO_MONITORS');
});
