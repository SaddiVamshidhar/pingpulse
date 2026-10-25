// Pure helper functions - kept free of database code so they can be unit tested.

export const calculateUptime = (checks) => {
  if (!checks || checks.length === 0) return null;
  const up = checks.filter((c) => c.status === 'UP').length;
  return Number(((up / checks.length) * 100).toFixed(2));
};

export const averageResponseTime = (checks) => {
  const times = (checks || [])
    .filter((c) => c.status === 'UP' && typeof c.responseTime === 'number')
    .map((c) => c.responseTime);
  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
};

export const overallStatus = (monitors) => {
  const active = (monitors || []).filter((m) => m.isActive);
  if (active.length === 0) return 'NO_MONITORS';
  const down = active.filter((m) => m.status === 'DOWN').length;
  if (down === 0) return 'OPERATIONAL';
  if (down === active.length) return 'MAJOR_OUTAGE';
  return 'PARTIAL_OUTAGE';
};
