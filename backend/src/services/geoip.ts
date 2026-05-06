const cache = new Map<string, { country: string; city: string; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isPrivateIP(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') || ip.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || ip === '::ffff:172.';
}

export async function lookupGeo(ip: string): Promise<{ country: string; city: string }> {
  if (isPrivateIP(ip)) {
    return { country: 'Local', city: 'Local' };
  }

  const cached = cache.get(ip);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { country: cached.country, city: cached.city };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const result = {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
    };
    cache.set(ip, { ...result, ts: Date.now() });
    return result;
  } catch {
    return { country: 'Unknown', city: 'Unknown' };
  }
}
