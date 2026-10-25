// Performs a single HTTP check and classifies the result as UP or DOWN.

export const classify = (statusCode, error) => {
  if (error) return 'DOWN';
  return statusCode >= 200 && statusCode < 400 ? 'UP' : 'DOWN';
};

export const isDue = (monitor, now = Date.now()) => {
  if (!monitor.lastCheckedAt) return true;
  return now - new Date(monitor.lastCheckedAt).getTime() >= monitor.intervalSec * 1000;
};

export const ping = async (url, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'PingPulse-Monitor/1.0' },
    });
    const responseTime = Math.round(performance.now() - started);
    return { status: classify(res.status), statusCode: res.status, responseTime, error: null };
  } catch (err) {
    const error = err.name === 'AbortError' ? `Timeout after ${timeoutMs} ms` : err.cause?.code || err.message;
    return { status: 'DOWN', statusCode: null, responseTime: null, error };
  } finally {
    clearTimeout(timer);
  }
};
