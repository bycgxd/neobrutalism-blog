import { Router, Response } from 'express';
import { Op, fn, col } from 'sequelize';
import PageView from '../models/PageView';
import Article from '../models/Article';
import { authenticate, AuthRequest } from '../middlewares/auth';

const router = Router();

router.get('/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalViews, uniqueVisitors, todayViews, todayUniqueVisitors] = await Promise.all([
      PageView.count(),
      PageView.count({ distinct: true, col: 'visitorId' }),
      PageView.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      PageView.count({ distinct: true, col: 'visitorId', where: { createdAt: { [Op.gte]: startOfToday } } }),
    ]);

    res.json({ totalViews, uniqueVisitors, todayViews, todayUniqueVisitors });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await PageView.findAll({
      attributes: ['page', [fn('COUNT', col('id')), 'views'], [fn('COUNT', fn('DISTINCT', col('visitorId'))), 'uniqueVisitors']],
      group: ['page'],
      order: [[fn('COUNT', col('id')), 'DESC']],
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/articles', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await PageView.findAll({
      attributes: ['articleId', [fn('COUNT', col('id')), 'views']],
      where: { articleId: { [Op.ne]: null } },
      group: ['articleId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 50,
    });

    const result = await Promise.all(
      stats.map(async (s: any) => {
        const article = await Article.findByPk(s.articleId);
        return {
          articleId: s.articleId,
          title: article?.title || '(已删除)',
          views: Number(s.getDataValue('views')),
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recent', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const total = await PageView.count();
    const views = await PageView.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    const result = views.map((v: any) => ({
      id: v.id,
      ip: v.ip,
      country: v.country,
      city: v.city,
      page: v.page,
      articleId: v.articleId,
      createdAt: v.createdAt,
    }));

    res.json({ visitors: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
