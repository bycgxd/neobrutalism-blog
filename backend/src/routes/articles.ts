import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import Article from '../models/Article';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get all articles (public, only visible ones unless authenticated)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.query.admin === 'true';
    const search = req.query.search as string;
    const category = req.query.category as string;

    const whereClause: any = isAdmin ? {} : { isHidden: false };
    
    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
      ];
    }
    
    const articles = await Article.findAll({
      where: whereClause,
      order: [['date', 'DESC']],
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single article
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create article (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update article (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.update(req.body);
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete article (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.destroy();
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle hidden status (protected)
router.patch('/:id/toggle-visibility', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.update({ isHidden: !article.isHidden });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
