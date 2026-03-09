const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function createRateLimiter({ windowMs = 60_000, limit = 60, prefix = 'global' } = {}) {
  return function rateLimit(req, res) {
    const ip = getClientIp(req);
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const record = buckets.get(key);

    if (!record || now > record.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(limit - 1));
      return true;
    }

    if (record.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: 'rate_limit_exceeded', retryAfterSeconds: retryAfter });
      return false;
    }

    record.count += 1;
    buckets.set(key, record);
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - record.count)));
    return true;
  };
}
