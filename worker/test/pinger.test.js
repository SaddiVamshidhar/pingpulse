import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { classify, isDue, ping } from '../src/pinger.js';

test('classify treats 2xx and 3xx as UP', () => {
  assert.equal(classify(200), 'UP');
  assert.equal(classify(301), 'UP');
  assert.equal(classify(404), 'DOWN');
  assert.equal(classify(503), 'DOWN');
  assert.equal(classify(null, 'ECONNREFUSED'), 'DOWN');
});

test('isDue respects the monitor interval', () => {
  const now = Date.now();
  assert.equal(isDue({ lastCheckedAt: null, intervalSec: 30 }, now), true);
  assert.equal(isDue({ lastCheckedAt: new Date(now - 10_000), intervalSec: 30 }, now), false);
  assert.equal(isDue({ lastCheckedAt: new Date(now - 31_000), intervalSec: 30 }, now), true);
});

test('ping reports UP for a healthy server and DOWN for an error status', async () => {
  const server = http.createServer((req, res) => {
    res.statusCode = req.url === '/broken' ? 500 : 200;
    res.end('ok');
  });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const ok = await ping(`http://127.0.0.1:${port}/`);
  assert.equal(ok.status, 'UP');
  assert.equal(ok.statusCode, 200);
  assert.ok(ok.responseTime >= 0);

  const broken = await ping(`http://127.0.0.1:${port}/broken`);
  assert.equal(broken.status, 'DOWN');
  assert.equal(broken.statusCode, 500);

  server.close();
});

test('ping reports DOWN when the host is unreachable', async () => {
  const result = await ping('http://127.0.0.1:1/', 2000);
  assert.equal(result.status, 'DOWN');
  assert.ok(result.error);
});
