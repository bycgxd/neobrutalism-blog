const BOT_PATTERNS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'semrush', 'ahrefsbot', 'dotbot', 'majestic12', 'rogerbot',
  'grapeshot', 'petalbot', 'applebot', 'crawler', 'bot',
];

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(pattern => ua.includes(pattern));
}
