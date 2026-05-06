import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import PageView from '../models/PageView';
import { isBot } from '../utils/botFilter';
import { lookupGeo } from '../services/geoip';

const router = Router();

function extractIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || '0.0.0.0';
  }
  return req.ip || req.socket?.remoteAddress || '0.0.0.0';
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, articleId } = req.body;

    if (!page) {
      res.status(400).json({ message: 'page is required' });
      return;
    }

    const ip = extractIP(req).replace(/^::ffff:/, '');
    const userAgent = req.headers['user-agent'] || null;

    if (isBot(userAgent)) {
      res.json({ tracked: false, reason: 'bot' });
      return;
    }

    const visitorId = crypto.createHash('sha256').update(`${ip}-${userAgent || ''}`).digest('hex');
    const geo = await lookupGeo(ip);

    await PageView.create({ ip, ...geo, page, articleId: articleId || null, visitorId, userAgent });

    res.status(201).json({ tracked: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
